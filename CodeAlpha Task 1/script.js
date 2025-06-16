function calculateAge() {
  const dobInput = document.getElementById("dob").value;
  const resultDiv = document.getElementById("result");

  if (!dobInput) {
    resultDiv.innerHTML = "<span style='color: #ff9999;'>⚠️ Please enter your birth date.</span>";
    return;
  }

  const dob = new Date(dobInput);
  const today = new Date();

  if (dob > today) {
    resultDiv.innerHTML = "<span style='color: #ff9999;'>⛔ Future date? Please enter a valid DOB.</span>";
    return;
  }

  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  resultDiv.innerHTML = `🎉 You are <strong>${years}</strong> years, <strong>${months}</strong> months, and <strong>${days}</strong> days old! 🎈`;
}

window.addEventListener("DOMContentLoaded", () => {
  const music = document.getElementById("bg-music");
  if (music) {
    music.volume = 0.2;

    // Try to autoplay on load (may be blocked by browser)
    const playPromise = music.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("Music autoplayed on load 🎵");
        })
        .catch((error) => {
          console.warn("Autoplay blocked 😶. Will start on click.");
          // Enable manual fallback
          window.addEventListener("click", () => {
            music.play();
          }, { once: true });
        });
    }
  }
});

