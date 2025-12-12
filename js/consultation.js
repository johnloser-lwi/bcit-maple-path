// Time slot selection
document.addEventListener("DOMContentLoaded", () => {
    const timeSlots = document.querySelectorAll(".time-slot");
    const summaryEl = document.querySelector("#selection-summary");

    timeSlots.forEach((slot) => {
        slot.addEventListener("click", () => {
            
            const group = slot.closest(".time-slot-group");
            if (group) {
                group.querySelectorAll(".time-slot").forEach((s) => {
                    s.classList.remove("selected");
                });
            }

            slot.classList.add("selected");

            const consultant = slot.dataset.consultant;
            const time = slot.dataset.time;

            if (summaryEl && consultant && time) {
                summaryEl.textContent = `You selected ${consultant} • ${time}.`;
            }
        });
    });

    // Confirm booking
    const confirmButtons = document.querySelectorAll(".confirm-button");

    confirmButtons.forEach(btn => {
        btn.addEventListener("click", () => {

            const selectedSlot = btn
                .closest(".consultant-card")
                .querySelector(".time-slot.selected");

            if (!selectedSlot) {
                alert("Please select a time slot before confirming.");
                return;
            }

            const consultant = selectedSlot.dataset.consultant;
            const time = selectedSlot.dataset.time;

            alert(`Booking Confirmed!\n\nConsultant: ${consultant}\nTime: ${time}`);
        });
    });

});
