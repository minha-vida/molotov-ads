# Molotov Ads

## What is it?

Molotov-ads is a javascript framework for loading ads the easiest way possible.
It is aimed for publishers of any size. Besides being easy, one of the primary goals is to boost revenue with features like:

*   Easy ad rotate, you specify the time and the limit
*   Lazy loading, you specify the pixel offset
*   Ad rotate safely, only when 50% of the ad is visible
*   Not loading ads that are hidden for the user

Molotov-ads doesn't need any other javascript frameworks to work properly.

## Usage

You will need the molotov-ads.js and your ad-server plugin.
Also, create an "madOptions" object in your page so the framework can receive any parameters you need.

eg.:
```HTML
<script async src="./build/dist/molotov-ads.js"></script>
<script async src="./build/dist/plugins/doubleclick.js"></script>
<script>
    var madOptions = {
        DoubleClick: {
            customTargets: {
                url: window.location.pathname
            },
            onSlotRenderEnded: function(slot) {
                console.log(slot);
            }
        }
    };
</script>
```

After that, just pass some parameters to the desired element:

```HTML
<div id="my-ad" data-mad data-mad-adunit="/101010/adunit" data-mad-size="[728,90]">
</div>
```

You can find the documentation for each plugin here:

*   [DoubleClick](src/plugins/doubleclick/readme.md)
*   [Rubicon Fastlane (with DoubleClick)](src/plugins/rubicon-fastlane-dfp/readme.md)

## Transparency

Plugins can use the Logger module to log anything they want.
If you want to check the logs, use the development script (not minified) and add ```#development``` to the end of the URL.

All logs should be in your developer console.

## Plugins

Molotov ads is just a collection of really useful modules.

If you want to contribute with your plugin code, read the contribute section below. You can use our already built plugins as inspiration.

## Contribute

*   Fork this repo
*   Clone it
*   ```npm install```
*   Create a pull request with your changes

Before running gulp for the final build, be sure that all typescript files are compiled at the ./build folder.
Gulp will just uglify and concat every js file in the ./build
folder.

We still need to update our gulp recipe so it also compile all typescript files. In the mean time, I recommend using some kind of IDE extension of your preference.
My personal preference goes to Atom with the AtomTypescript extension.
Most IDE extensions will follow the settings from the tsconfig.json file.

Use gulp to generate the final build (molotov-ads.min.js file).

```
$ gulp
```

You can also use gulp to watch all changes and automatically create all the build files.

```
$ gulp watch
```

## To do list

*   [ ] Tests, please help us test this
*   [ ] Compiling typescript files
*   [ ] More ad servers Plugins
*   [ ] Remove all logger modules entries for the minified version
