# The Sauna Showdown

A small, phone-friendly tracker for Connor and Joe's Christmas 2026 weight and waist challenge.

## Scoring

- Waist reduction is weighted at 60%.
- Bodyweight reduction is weighted at 40%.
- Each person's first saved entry is their baseline.
- Score = 0.6 × percentage of baseline waist lost + 0.4 × percentage of baseline bodyweight lost.

## Data and sharing

The starting entries (100kg/43in for Connor and 85.3kg/43in for Joe, dated 9 November 2026) are preloaded in the public dashboard. Later entries stay in the current browser's local storage. After a weigh-in, export the JSON challenge file and send it to the other participant. Importing a file merges entries by person and date, so both people can keep the same scoreboard. Keep the exported file between you, as it includes both people's measurements.

## Publish

The folder can be served as a static page from the repository's GitHub Pages site at `/FITLP/sauna-challenge/`.
