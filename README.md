# Visual Comparison Tool for SVG and Lottie Animations

This tool automates the visual comparison of SVG files and their corresponding Lottie animation conversions using Playwright and Resemble.js. It's designed to help validate the fidelity of Lottie exports against their original SVG counterparts.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 18.12.1 is required)
- npm (typically comes with Node.js)

## Setup and Configuration

### Clone the Repository

Start by cloning this repository to your local machine and navigate into the project directory:

```bash
git clone https://github.com/maxphase/svg-lottie-acceptance.git
cd svg-lottie-acceptance
```

### Install Dependencies

Install the required Node.js dependencies by running:

`npm install`

#### Install playwright browsers

`npx playwright install`

### Environment Configuration

The script uses environment variables for configuration. A sample configuration file (sample.env) is included in the project. To start:

Copy sample.env to .env:

`cp sample.env .env`

Adjust the paths in .env to point to your SVG and Lottie file locations. It's recommended to create a directory called sandbox within your project directory and organize your SVG and Lottie files there.

#### Important Note

This script assumes that lottie files in the lottie directory have same corresponding File IDs as original svg files. I.E.
```
1000.svg -> 1000.json
2345.svg -> 2345.json
```

`SVG_FOLDER_PATH`: The path to the folder containing your SVG files.
`LOTTIE_FOLDER_PATH`: The path to the folder containing your Lottie JSON files.
Set `MAX_WORKERS` in your `.env` file to the number of concurrent workers your machine can support. This depends on your machine's compute capabilities and affects how many tests run in parallel.

``` bash
SVG_FOLDER_PATH=./sandbox/svg
LOTTIE_FOLDER_PATH=./sandbox/lottie
MAX_WORKERS=20
```

Remember to replace the placeholder values with the actual paths relevant to your project and machine.

## Usage

After configuring your environment, you can run the visual comparison tool with:

`npx playwright test`

This command will execute the tests as defined, comparing each SVG file in your specified directory with its corresponding Lottie file and generating visual diffs for any discrepancies found.

## Notes

Ensure that the version of Node.js installed is 18.12.1 to avoid compatibility issues.
The number of MAX_WORKERS should be adjusted based on your testing needs and the capabilities of your testing environment.
