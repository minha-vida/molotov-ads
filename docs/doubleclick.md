# DoubleClick plugin

Remember, molotov-ads does not load the DFP library. It's your responsibility to load it in your page.

Options for this plugin:

| Parameter | Description | Example
| --- | --- | ---
| `data-mad` | Required. This parameter tells the framework that this element is an ad slot | `data-mad`
| `data-mad-adunit` | Required. The adunit to be used in DFP | `data-mad-adunit="/101010/my_ad_unit"`
| `data-mad-size` | Required only if ad is **not** out of page | `data-mad-size="[300,250]"`
| `data-mad-out-of-page` | Required only if ad is out of page | `data-mad-out-of-page="true"`
| `data-mad-auto-refresh-in-seconds` | Optional. Set how many seconds the ad should wait (after loaded) to refresh | `data-mad-auto-refresh-in-seconds="20"`
| `data-mad-auto-refresh-limit` | Optional. Set a limit for the auto refresh | `data-mad-auto-refresh-limit="3"`
| `data-mad-lazyload-offset` | Optional. Enables lazy load functionality when the chosen offset (in pixels) is reached | `data-mad-lazyload-offset="100"`

Also, your madOptions should be:

```HTML
<script>
    var madOptions = {
        DoubleClick: {
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
