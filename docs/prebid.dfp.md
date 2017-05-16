# Prebid.js DoubleClick plugin

This plugin supports the same parameters as our [DoubleClick plugin](/docs/doubleclick.md).

Remember, molotov-ads does not load the DFP library. It's your responsibility to load it in your page.

You will also have to load the prebid.js code on your page.

Your madOptions should be:

```HTML
<script>
    var madOptions = {
        PrebidDfp: {
            PREBID_TIMEOUT: 700, //you can modify this as you wish
            sendAllBids: false, //if you want to send all the bids
            logBids: true, //if you want to log the bids in the development version
            adUnits: [{
                //adunits with all the bids
            }],
            customTargets: {
                pagetitle: "Cool documentation page",
                url: window.location.pathname
            },
            onSlotRenderEnded: function(slot) {
                //any code written here will be executed when each ad is loaded by DFP.
            }
        }
    };
</script>
```
