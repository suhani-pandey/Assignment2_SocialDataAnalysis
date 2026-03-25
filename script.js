(function () {
  const data = JSON.parse(document.getElementById("story-data").textContent);
  const categories = data.metadata.focus_categories;
  const rows = data.category_hour;
  const categorySelect = document.getElementById("category-select");
  const chartEl = document.getElementById("polar-chart");
  const progressBar = document.getElementById("scroll-progress-bar");
  const glowA = document.querySelector(".glow-a");
  const glowB = document.querySelector(".glow-b");

  const colors = {
    Weekday: "#245c69",
    Weekend: "#d04f2d",
  };

  function populateSelect() {
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
    categorySelect.value = "Robbery";
  }

  function buildPolar(category) {
    const subset = rows.filter((row) => row.category === category);
    const weekday = subset.filter((row) => row.label === "Weekday").sort((a, b) => a.hour - b.hour);
    const weekend = subset.filter((row) => row.label === "Weekend").sort((a, b) => a.hour - b.hour);

    const traces = [
      {
        type: "barpolar",
        r: weekday.map((row) => row.avg_per_day),
        theta: weekday.map((row) => row.hour * 15),
        width: new Array(24).fill(14),
        name: "Weekday",
        marker: {
          color: colors.Weekday,
          line: { color: "rgba(255,255,255,0.35)", width: 1 },
          opacity: 0.82,
        },
        hovertemplate: "Weekday<br>%{theta:.0f} deg clock position<br>Hour: %{customdata}:00<br>Average incidents: %{r:.2f}<extra></extra>",
        customdata: weekday.map((row) => row.hour),
      },
      {
        type: "barpolar",
        r: weekend.map((row) => row.avg_per_day),
        theta: weekend.map((row) => row.hour * 15),
        width: new Array(24).fill(10),
        name: "Weekend",
        marker: {
          color: colors.Weekend,
          line: { color: "rgba(255,255,255,0.35)", width: 1 },
          opacity: 0.82,
        },
        hovertemplate: "Weekend<br>%{theta:.0f} deg clock position<br>Hour: %{customdata}:00<br>Average incidents: %{r:.2f}<extra></extra>",
        customdata: weekend.map((row) => row.hour),
      },
    ];

    const layout = {
      title: {
        text: `When does <span style="color:${colors.Weekend}">${category}</span> happen?`,
        x: 0.02,
        xanchor: "left",
        y: 0.96,
        font: { size: 24 },
      },
      template: "plotly_white",
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(255,255,255,0.85)",
      margin: { l: 20, r: 20, t: 118, b: 24 },
      font: { family: "Manrope, sans-serif", color: "#18261f" },
      legend: {
        orientation: "h",
        yanchor: "bottom",
        y: 1.01,
        x: 0.02,
      },
      polar: {
        bgcolor: "rgba(255,255,255,0)",
        radialaxis: {
          angle: 90,
          showline: false,
          gridcolor: "rgba(24,38,31,0.10)",
          tickfont: { size: 10 },
        },
        angularaxis: {
          direction: "clockwise",
          rotation: 90,
          tickmode: "array",
          tickvals: [0, 45, 90, 135, 180, 225, 270, 315],
          ticktext: ["00", "03", "06", "09", "12", "15", "18", "21"],
          gridcolor: "rgba(24,38,31,0.08)",
        },
      },
    };

    Plotly.react(chartEl, traces, layout, {
      responsive: true,
      displayModeBar: false,
    });
  }

  function registerReveal() {
    const revealEls = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((element) => observer.observe(element));
  }

  function registerScrollProgress() {
    function update() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      progressBar.style.width = `${pct}%`;
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function registerParallax() {
    window.addEventListener(
      "pointermove",
      (event) => {
        const x = (event.clientX / window.innerWidth - 0.5) * 18;
        const y = (event.clientY / window.innerHeight - 0.5) * 18;
        glowA.style.transform = `translate(${x}px, ${y}px)`;
        glowB.style.transform = `translate(${-x}px, ${-y}px)`;
      },
      { passive: true }
    );
  }

  populateSelect();
  buildPolar(categorySelect.value);
  registerReveal();
  registerScrollProgress();
  registerParallax();

  categorySelect.addEventListener("change", () => buildPolar(categorySelect.value));
})();
