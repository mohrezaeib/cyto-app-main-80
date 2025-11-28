document.addEventListener("DOMContentLoaded", function () {
    const selectAll = document.getElementById("selectAllFields");
    const fieldCheckboxes = document.querySelectorAll(".field-checkbox");
    const dropdownMenu = document.querySelector(".dropdown-menu");

    // Prevent dropdown from closing when clicking inside
    dropdownMenu.addEventListener("click", function (event) {
        event.stopPropagation();
    });

    // Handle "Select All" checkbox
    selectAll.addEventListener("change", function () {
        fieldCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAll.checked;
        });
    });

    // Ensure "All Fields" updates dynamically
    function updateAllFields() {
        selectAll.checked = [...fieldCheckboxes].every(checkbox => checkbox.checked);
    }

    fieldCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", function () {
            updateAllFields();
        });
    });

    // Run on load to set initial state
    updateAllFields();
});


  (function initViewers(){
    const STEP = 120;     // px per tick
    const HOLD_MS = 100;  // tick interval when holding

    document.querySelectorAll('.image-viewer-wrapper').forEach(wrapper => {
      const viewer = wrapper.querySelector('.image-viewer');
      const btnL   = wrapper.querySelector('.scroll-left');
      const btnR   = wrapper.querySelector('.scroll-right');
      let holdTimer = null;

      function scrollByStep(dir) {
        viewer.scrollBy({ left: dir * STEP, behavior: 'smooth' });
        update();
      }
      function startHold(dir) {
        stopHold();
        scrollByStep(dir);
        holdTimer = setInterval(() => viewer.scrollBy({ left: dir * STEP }), HOLD_MS);
      }
      function stopHold() { if (holdTimer) { clearInterval(holdTimer); holdTimer = null; } }

      // Click
      btnL.addEventListener('click', () => scrollByStep(-1));
      btnR.addEventListener('click', () => scrollByStep(1));

      // Press-and-hold (mouse/touch/pointer)
      ['pointerdown','mousedown','touchstart'].forEach(ev => {
        btnL.addEventListener(ev, e => { e.preventDefault(); startHold(-1); });
        btnR.addEventListener(ev, e => { e.preventDefault(); startHold( 1); });
      });
      ['pointerup','mouseup','mouseleave','touchend','touchcancel'].forEach(ev => {
        btnL.addEventListener(ev, stopHold);
        btnR.addEventListener(ev, stopHold);
      });

      function update(){
        const canX = viewer.scrollWidth > viewer.clientWidth + 1;
        btnL.style.display = canX && viewer.scrollLeft > 0 ? 'flex' : 'none';
        const atRight = viewer.scrollLeft + viewer.clientWidth >= viewer.scrollWidth - 1;
        btnR.style.display = canX && !atRight ? 'flex' : 'none';
      }
      viewer.addEventListener('scroll', update);
      window.addEventListener('resize', update);
      update();
    });
  })();
