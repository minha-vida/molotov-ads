# Rubicon Fastlane (with DoubleClick) plugin

This plugin supports the same parameters as our [DoubleClick plugin](/src/plugins/doubleclick).

Remember, it's your responsibility to load both DFP and Rubicon libraries in your page. Molotov-ads does not load them for you.

Options for this plugin:

| Parameter | Description | Example
| --- | --- | ---
| `data-mad-rubicon-position` | Required. This parameter is required for every slot you wish to use fastlane with. Expected values are "atf" or "btf". If you don't use this parameter this plugin will fallback to DFP, thus not using fastlane for that slot  | `data-mad-rubicon-position="atf"`

Also, your madOptions object should have an entry for this plugin:

```HTML
<script>
    var madOptions = {
        RubiconFastlaneDfp: {
            customTargets: {
                pagetitle: "Cool documentation page",
                url: window.location.pathname
            },
            setFPI: {
                pagetitle: "Cool documentation page",
                url: window.location.pathname
            },
            setFPV: {
                age: 20
            },
            onSlotRenderEnded: function(slot) {
                //any code written here will be executed when each ad is loaded by DFP.
            },
            rubicontagRun: function () {
                //any code written here will be executed when rubicontag.run is called.
            }
        }
    };
</script>
```
