# filter.py
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Union


@dataclass
class FilterParams:
    """Dataclass to hold all filter parameters from frontend"""
    query: str = ""
    page: int = 1
    per_page: Optional[int] = None
    min_molweight: Optional[float] = None
    max_molweight: Optional[float] = None
    min_ic50: Optional[float] = None
    max_ic50: Optional[float] = None
    activity: Optional[str] = None
    reversibility: Optional[str] = None
    quantity_type: Optional[str] = None
    min_quantity: Optional[float] = None
    max_quantity: Optional[float] = None
    selected_fields: List[str] = None

    def __post_init__(self):
        if self.selected_fields is None:
            self.selected_fields = []


class CompoundFilter:
    """Main filter class for applying all filters to compound data"""

    def __init__(self):
        self._num_re = re.compile(r"[-+]?\d*\.\d+|\d+")

    def normalize_name(self, s: str) -> str:
        """Normalize field names for flexible matching"""
        return "".join(str(s).split()).lower() if s is not None else ""

    def get_field_value(self, item_fields: Dict[str, Any], target_field: str) -> Any:
        """Get field value with flexible naming matching"""
        target_normalized = self.normalize_name(target_field)

        # Exact match first
        for field_name, value in item_fields.items():
            if self.normalize_name(field_name) == target_normalized:
                return value

        # Contains match
        for field_name, value in item_fields.items():
            normalized_field = self.normalize_name(field_name)
            if target_normalized in normalized_field or normalized_field in target_normalized:
                return value

        return None

    def parse_number(self, value: Any) -> Optional[float]:
        """Extract first numeric value from any input"""
        if value is None:
            return None

        if isinstance(value, (int, float)):
            return float(value)

        match = self._num_re.search(str(value))
        return float(match.group()) if match else None

    def apply_numeric_filter(self, item_value: Any, min_val: Optional[float], max_val: Optional[float]) -> bool:
        """Apply min/max numeric filter with None handling"""
        numeric_value = self.parse_number(item_value)

        # If no constraints, always pass
        if min_val is None and max_val is None:
            return True

        # If constraints exist but no numeric value, exclude
        if numeric_value is None:
            return False

        # Check bounds
        if min_val is not None and numeric_value < min_val:
            return False
        if max_val is not None and numeric_value > max_val:
            return False

        return True

    def apply_text_filter(self, item_value: Any, filter_value: str) -> bool:
        """Case-insensitive text containment filter"""
        if not filter_value:
            return True

        item_text = str(item_value or "").lower()
        return filter_value.lower() in item_text

    def apply_activity_filter(self, fields: Dict[str, Any], activity: str) -> bool:
        """Apply actin disruption activity filter"""
        if not activity:
            return True

        activity_value = str(
            fields.get("Actin Disruption Activity") or
            self.get_field_value(fields, "actindisruptionactivity") or
            ""
        )
        return activity.lower() in activity_value.lower()


    def apply_reversibility_filter(self, fields: Dict[str, Any], reversibility: str) -> bool:
        """Apply reversibility filter with mapping"""
        if not reversibility:
            return True

        reversibility_value = str(
            fields.get("Reversibilty") or
            fields.get("Reversibility") or
            self.get_field_value(fields, "reversibility") or
            ""
        ).strip()

        if reversibility == "+":
            return "+" in reversibility_value
        
        elif reversibility == "-":
            return "-" in reversibility_value
        
       
        elif reversibility.lower() == "not tested":
            return "not tested" in reversibility_value.lower()
        
        else:
            # For other values (Reversible, Irreversible, etc.)
            return reversibility.lower() in reversibility_value.lower()

    def apply_quantity_filter(self, fields: Dict[str, Any], params: FilterParams) -> bool:
        """Apply quantity filter based on quantity_type"""
        if not params.quantity_type:
            return True

        quantity_value = self.get_field_value(fields, "quantity")
        quantity_numeric = self.parse_number(quantity_value)

        if params.quantity_type == "numeric":
            return self.apply_numeric_filter(quantity_value, params.min_quantity, params.max_quantity)
        elif params.quantity_type == "available":
            return str(quantity_value).lower() == "available"
        elif params.quantity_type == "not available":
            return not (str(quantity_value).lower() == "available" or quantity_numeric is not None)

        return True

    def apply_search_filter(self, fields: Dict[str, Any], query: str, selected_fields: List[str]) -> bool:
        """Apply text search across specified fields"""
        if not query:
            return True

        fields_to_search = selected_fields if selected_fields else list(fields.keys())

        for field_name in fields_to_search:
            field_value = fields.get(field_name) or self.get_field_value(fields, field_name)
            if field_value and query.lower() in str(field_value).lower():
                return True

        return False

    def filter_compounds(self, compounds: List[Dict], params: FilterParams) -> List[Dict]:
        """Mai  n filtering method - applies all filters to compound data"""
        filtered = []

        for compound in compounds:
            fields = compound.get("fields", {})

            # Apply all filters
            if not all([
                self.apply_numeric_filter(
                    self.get_field_value(fields, "totalmolweight"),
                    params.min_molweight,
                    params.max_molweight
                ),
                self.apply_numeric_filter(
                    self.get_field_value(fields, "ic50"),
                    params.min_ic50,
                    params.max_ic50
                ),
                self.apply_activity_filter(fields, params.activity),
                self.apply_reversibility_filter(fields, params.reversibility),
                self.apply_quantity_filter(fields, params),
                self.apply_search_filter(fields, params.query, params.selected_fields)
            ]):
                continue

            filtered.append(compound)

        return filtered
