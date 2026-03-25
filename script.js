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

// ── PEAKS GRID ────────────────────────────────────────
(function buildPeaksGrid() {
  const grid = document.getElementById('peaks-grid');
  if (!grid) return;

  // Group peaks by category, pick the highest avg
  const catPeak = {};
  peaks.forEach(p => {
    if (!catPeak[p.category] || p.avg_per_day > catPeak[p.category].avg_per_day) {
      catPeak[p.category] = p;
    }
  });

  const icons = {
    'Robbery': '🚨',
    'Vehicle Theft': '🚗',
    'Drug Offense': '💊',
    'Warrants': '📋',
    'Weapon Offense': '⚠️',
    'Missing Person': '🔍',
    'Non-Criminal': '📞'
  };

  const notes = {
    'Robbery': 'Surges after midnight on weekends — peaks at 2AM Saturday',
    'Vehicle Theft': 'Evening rush hour — both weekday 6PM and weekend 10PM',
    'Drug Offense': 'Strongly daytime — 2PM weekday peak, fades after dark',
    'Warrants': 'Business hours phenomenon — 4-5PM peak both days',
    'Weapon Offense': 'Midnight weekends — but spread across whole evening',
    'Missing Person': 'Lunchtime reports — 12PM peak holds on both day types',
    'Non-Criminal': 'Noon peak every day — routine reporting pattern'
  };

  Object.entries(catPeak).forEach(([cat, p]) => {
    const hLabel = p.hour === 0 ? '12AM' : p.hour < 12 ? p.hour+'AM' : p.hour === 12 ? '12PM' : (p.hour-12)+'PM';
    const isNight = p.hour >= 20 || p.hour <= 5;
    const accent = p.label === 'Weekend' ? '#f0622a' : '#2ab8c8';

    const card = document.createElement('div');
    card.style.cssText = `
      padding: 20px;
      border-radius: 16px;
      background: rgba(10,18,32,0.6);
      border: 1px solid rgba(240,230,208,0.08);
      border-top: 2px solid ${accent};
    `;
    card.innerHTML = `
      <div style="font-size:1.6rem;margin-bottom:10px">${icons[cat] || '•'}</div>
      <div style="font-family:'IBM Plex Mono',monospace;font-size:0.65rem;color:rgba(240,230,208,0.4);letter-spacing:0.2em;text-transform:uppercase;margin-bottom:6px">${cat}</div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:2.8rem;color:${accent};line-height:1">${hLabel}</div>
      <div style="font-family:'IBM Plex Mono',monospace;font-size:0.7rem;color:rgba(240,230,208,0.5);margin:4px 0 10px">${p.label} · ${p.avg_per_day.toFixed(2)} avg/day</div>
      <div style="font-size:0.82rem;color:rgba(240,230,208,0.55);line-height:1.5">${notes[cat]||''}</div>
    `;
    grid.appendChild(card);
  });
})();
