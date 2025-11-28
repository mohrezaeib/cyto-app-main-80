# parse_sdf.py
import base64
import io
import json
import unicodedata
import difflib
from pathlib import Path
from rdkit import Chem
from rdkit.Chem import Draw, rdDepictor

rdDepictor.SetPreferCoordGen(True)

# Where the figures live and which extensions to consider
IMAGE_DIR = Path("../static") / "Final Figures"
IMAGE_EXTS = {".tif", ".tiff", ".png", ".jpg", ".jpeg"}

def normalize(s: str) -> str:
    """Lowercase, strip accents, and remove non-alphanumerics for robust matching."""
    # Convert to string if it's not already
    if not isinstance(s, str):
        s = str(s)
    s = unicodedata.normalize("NFKD", s).casefold()
    return "".join(ch for ch in s if ch.isalnum())

def index_images(image_dir=IMAGE_DIR):
    """Return [(filename, normalized_stem)] for candidates in the image directory."""
    image_dir = Path(image_dir)
    candidates = []
    if image_dir.is_dir():
        for p in image_dir.iterdir():
            if p.is_file() and p.suffix.lower() in IMAGE_EXTS:
                candidates.append((p.name, normalize(p.stem)))
    return candidates

def match_image(compound: str, candidates, threshold: float = 0.80):
    """Find best filename for the given compound, or None if no good match."""
    if not compound:
        return None
    c_norm = normalize(compound)
    best_score = 0.0
    best_name = None
    for fname, norm in candidates:
        # quick wins for contains/equality
        if c_norm == norm:
            score = 1.0
        elif c_norm in norm or norm in c_norm:
            score = 0.95
        else:
            score = difflib.SequenceMatcher(None, c_norm, norm).ratio()
        if score > best_score:
            best_score, best_name = score, fname
    return best_name if best_score >= threshold else None

from PIL import Image, ImageOps
def ensure_web_image(path: Path) -> Path:
    if path.suffix.lower() in {".tif", ".tiff"}:
        out = path.with_suffix(".png")
        if (not out.exists()) or (path.stat().st_mtime > out.stat().st_mtime):
            with Image.open(path) as im:
                if getattr(im, "n_frames", 1) > 1:
                    im.seek(0)
                im = ImageOps.exif_transpose(im)
                if im.mode not in ("RGB", "RGBA"):
                    im = im.convert("RGBA")
                out.parent.mkdir(parents=True, exist_ok=True)
                im.save(out, "PNG", optimize=True)
        return out
    return path

def convert_string_to_number(value):
    if value is None or value.strip() == "":
        return ""
    
   
    value = str(value).strip()
    
  
    if any(char in value for char in ['/', '\\', '@', '(', ')', '[', ']', '=', '#', '+', '-']):
        return value
    
    # Check if it looks like a quantity with units (e.g., "3.47 mg")
    import re
    quantity_pattern = r'^\s*[-+]?\d*\.?\d+\s*(mg|g|ml|l|mM|µM|nM|ppm|%|units?)\s*$'
    if re.match(quantity_pattern, value, re.IGNORECASE):
        # Extract just the numeric part
        number_match = re.search(r'[-+]?\d*\.?\d+', value)
        if number_match:
            try:
                num_str = number_match.group()
                f = float(num_str)
                if f.is_integer():
                    return int(f)
                return f
            except ValueError:
                return value
    
    
    try:
        f = float(value)
        if f.is_integer():
            return int(f)
        return f
    except ValueError:
        return value


def parse_sdf_to_data(sdf_path, image_dir=IMAGE_DIR):
    candidates = index_images(image_dir)
    suppl = Chem.SDMolSupplier(str(sdf_path), sanitize=False, removeHs=False, strictParsing=False)

    # DEBUG: inspect first molecule
    first_mol = next(iter(suppl), None)
    if first_mol is not None:
        print("First molecule properties:", list(first_mol.GetPropNames()))
    else:
        print("No valid molecules found in SDF")

    results = []
    mol_idx = 0
    # # Debugging which be readed
    # for i, mol in enumerate(suppl):
    #     if mol is None:
    #         print(f"DEBUG: Molecule {i} is None")
    #         continue
    #     print(f"DEBUG: Molecule {i} has properties: {mol.GetPropNames()}")

    for mol in suppl:
        if mol is None:
            # debug which is none of this molcule
            print("Skipping invalid molecule")
            continue

        # 2D coords + PNG preview (as before)
        Chem.rdDepictor.Compute2DCoords(mol)
        img = Draw.MolToImage(mol, size=(1000, 1000))
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        b64 = base64.b64encode(buf.getvalue()).decode('utf-8')

        # Collect SDF props
        fields_dict = {}
        for prop_name in mol.GetPropNames():
            value = mol.GetProp(prop_name)
            converted = convert_string_to_number(value)

            # Handle specific field cases
            if prop_name == "Reversibilty" and converted == "":
                converted = "not tested"
            elif prop_name == "Actin Disruption Activity" and converted == "":
                converted = "not tested"
            elif prop_name == "Quantity" and converted == "":
                converted = "not available"

            fields_dict[prop_name] = converted

            # Debug print for verification
            print(f"DEBUG: {prop_name} -> {value} (converted: {converted}, type: {type(converted)})")

        # Fuzzy-match the image filename using the Compound field
        compound_name = fields_dict.get("Compound", "")
        matched = match_image(compound_name, candidates)
        if matched:
            p = (IMAGE_DIR / matched).resolve()
            p = ensure_web_image(p)
            fields_dict["Image File"] = p.name   # now a .png if it was .tif

        results.append({
            "mol_idx": mol_idx,
            "base64_png": b64,
            "fields": fields_dict,
        })
        mol_idx += 1

    return results

if __name__ == "__main__":
    sdf_path = Path("../static/CytoLabs_Database.sdf")
    data = parse_sdf_to_data(sdf_path)
    with open("../static/data.json", "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)

