---
title: Would You Have Survived the Titanic?
date: 2026-08-17
label: Data Science
image: '/images/03-project_Main.png'
featured: true
---
The last two Titanic projects lived entirely in notebooks: exploratory analysis, then a full model comparison. This one takes the winning model out of the notebook entirely and puts it in front of anyone who wants to try it, no code, no setup, just answer a few questions and get a live prediction.

Try it below, or open it directly: [couldyousurvivethetitanic.streamlit.app](https://couldyousurvivethetitanic.streamlit.app/)

Full app code: [WayneS0628/SurviveTheTitanic](https://github.com/WayneS0628/SurviveTheTitanic)

<div class="gallery-box">
  <iframe
    src="https://couldyousurvivethetitanic.streamlit.app/?embed=true"
    height="800"
    width="100%"
    style="border:none; border-radius:8px;"
    loading="lazy">
  </iframe>
  <em>Live prediction tool, embedded directly. If it doesn't load, <a href="https://couldyousurvivethetitanic.streamlit.app/" target="_blank">open it in a new tab</a>.</em>
</div>

## Where the Model Came From

Nothing gets trained in this app, it's pure inference. The model itself is the neural network that won the [Decision Tree vs Neural Network](/projects/titanic-dtvsnn) comparison, trained on the Kaggle Titanic dataset and evaluated against Kaggle's real leaderboard (0.7608 public score). That project in turn built on the feature choices and cleaning decisions from my original [Titanic EDA](/projects/titanic-eda).

Three projects, one thread: explore the data, build and compare models on it, then hand the winner to anyone who wants to play with it.

The app loads two saved artifacts on startup: the trained neural network and the scaler that was fit on the original training data. Whatever you enter above gets scaled the exact same way the training data was scaled, then passed through the network in a single forward pass, no retraining, no drift, always exactly the model that was evaluated in the comparison project.

## Why Build This At All

A notebook proves you can build a good model. An interactive tool proves you can ship one. This was also a good excuse to work through a real deployment pipeline end to end: saving a trained Keras model and scaler to disk, wiring them into a lightweight Streamlit frontend, cleaning up a dependency file that had accidentally inherited a huge unrelated package list from an older project, and deploying for free on Streamlit Community Cloud.

## What's Next

A natural extension would be surfacing *why* the model predicted what it did for your specific inputs, rather than just a probability. I'm also curious to expose the decision threshold itself, right now it's a flat 0.5 cutoff, but this is a good place to let someone feel out the precision/recall tradeoff by dragging that threshold and watching the prediction shift.

Try the live app: [couldyousurvivethetitanic.streamlit.app](https://couldyousurvivethetitanic.streamlit.app/) · Full code: [WayneS0628/SurviveTheTitanic](https://github.com/WayneS0628/SurviveTheTitanic)
