---
title: Titanic EDA
date: 2026-07-23
label: Data Science
image: '/images/01-project_Main.png'
featured: true
---
Who survived the Titanic, and what did survival actually depend on? For my first start-to-finish exploratory data analysis, I took the classic Titanic passenger dataset and worked it from raw load to published findings in a single sprint: cleaning missing data, engineering features, and pulling out the patterns behind who made it off the ship.

The dataset covers 891 passengers with their age, sex, ticket class, fare, family aboard, and boarding port. I chose it deliberately for its massive community support, so I could focus on sharpening my pandas, seaborn, and matplotlib workflow instead of fighting the data.

Full notebook and code: [WayneS0628/titanic-eda](https://github.com/WayneS0628/titanic-eda)

## Cleaning the Data

Every column with missing values got its own treatment, chosen based on how much was missing and what the column represents:

- **Age (~20% missing)**: filled with the median, since it's more robust to outliers than the mean. In hindsight, a group-wise median by class and sex would have been smarter, because first class passengers skewed notably older than third class, and the global fill creates an artificial spike at the median age.
- **Embarkation port (2 missing)**: filled with the mode. With only 2 rows missing, the mode is the statistically likeliest value, and keeping the rows beats dropping them.
- **Deck (~77% missing)**: with that much missing data, imputing would be fiction. Instead, "Unknown" became its own category, which required registering it first since the column is a categorical dtype.
- **Redundant columns**: `embarked` and `alive` duplicated `embark_town` and `survived`, so they were dropped.

I also engineered one feature: `sibsp` (siblings/spouses aboard) and `parch` (parents/children aboard) both measure family, so I combined them into a single `family_size` column.

## Broad Exploration

Before targeted questions, a pairplot across the numeric features as a quick scan for relationships worth digging into. It flagged class as a strong separator of survivors, which shaped the sections that follow. Fun for a first look, but the focused charts below do the real work.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/01-project_titanic_pairplot.png" loading="lazy" alt="Pairplot of numeric features colored by survival">
  </div>
  <em>Quick-look pairplot across age, fare, class, and family size</em>
</div>

## How Much Did Sex and Class Matter?

The two strongest survival factors, viewed from three angles: raw counts, rates side by side, and a rate scoreboard. Women in first class survived at roughly 95% while men in third class survived at roughly 15%. Nothing else in the dataset comes close to that gap. The stacked counts also show that women out-survived men despite being outnumbered on board.

<div class="gallery-box">
  <div class="gallery" style="display:grid; grid-template-columns:1fr; gap:12px;">
    <img src="/images/01-project_titanic_sex_counts.png" loading="lazy" alt="Survival counts by sex">
  </div>
  <div class="gallery" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:12px;">
    <img src="/images/01-project_titanic_class_sex.png" loading="lazy" alt="Survival rate by class and sex">
    <img src="/images/01-project_titanic_heatmap.png" loading="lazy" alt="Survival rate heatmap by class and sex">
  </div>
  <em>Counts, rates, and the class-by-sex scoreboard</em>
</div>

## Did Age Matter?

Overlaid density curves of survivor and non-survivor ages tell the "women and children first" story numerically: a clear survival bump for children under 10, while adults between 20 and 35 fared worst. One honest caveat: about 20% of ages were median-imputed, which adds an artificial spike at the median age.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/01-project_titanic_age_kde.png" loading="lazy" alt="Age distribution of survivors vs non-survivors">
  </div>
  <em>Age distributions, normalized per group</em>
</div>

## Did Traveling with Family Help?

Plotting survival rate against family size shows a rise-then-fall pattern: families of 2 to 4 survived at the highest rates, beating both solo travelers and large families. The error bars widen at larger family sizes because few passengers traveled in big groups, so those estimates are less reliable.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/01-project_titanic_family_size.png" loading="lazy" alt="Survival rate by family size">
  </div>
  <em>Survival rate by family size with confidence intervals</em>
</div>

## Deep Dive: The Cherbourg Effect

My favorite thread of the project. Passengers who boarded at Cherbourg, France survived at noticeably higher rates than those from Southampton or Queenstown. Rather than reporting that at face value, I suspected a confounder and checked the class composition of each port: roughly half of Cherbourg's passengers were first class, while the other ports were dominated by third.

After controlling for class, most of Cherbourg's advantage disappeared, though a residual gap remained, most visibly in third class. One more honest caveat: Queenstown's upper-class estimates have huge error bars because almost nobody from Queenstown traveled first or second class.

<div class="gallery-box">
  <div class="gallery" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
    <img src="/images/01-project_titanic_port_survival.png" loading="lazy" alt="Survival rate by embarkation port">
    <img src="/images/01-project_titanic_port_counts.png" loading="lazy" alt="Survival counts by embarkation port">
  </div>
  <div class="gallery" style="display:grid; grid-template-columns:1fr; gap:12px; margin-top:12px;">
    <img src="/images/01-project_titanic_port_sex.png" loading="lazy" alt="Survival rate by port and sex">
  </div>
  <div class="gallery" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:12px;">
    <img src="/images/01-project_titanic_port_composition.png" loading="lazy" alt="Class composition by embarkation port">
    <img src="/images/01-project_titanic_port_class.png" loading="lazy" alt="Survival by class and embarkation port">
  </div>
  <em>The full investigation: pattern, suspicion, composition check, and controlling for class</em>
</div>


## What I Took Away

Beyond the findings themselves, this project was about building confidence in my tools: per-column missing data strategies, feature engineering, reading confidence intervals critically, and knowing when a chart shows rates versus raw counts. I also documented what I'd do differently rather than hiding it, which turned out to be some of the most valuable writing in the notebook.

Explore the full analysis, cleaning decisions, and limitations on GitHub: [WayneS0628/titanic-eda](https://github.com/WayneS0628/titanic-eda)
