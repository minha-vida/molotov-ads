# SmartAdserver plugin

Remember, molotov-ads does not load the SmartAdserver library. It's your responsibility to load it in your page.

Options for this plugin:

| Parameter | Description | Example
| --- | --- | ---
| `data-mad` | Required. This parameter tells the framework that this element is an ad slot | `data-mad`
| `data-mad-smartad-id` | Required. The adunit to be used in Smart | `12345`
| `data-mad-auto-refresh-in-seconds` | Optional. Set how many seconds the ad should wait (after loaded) to refresh | `data-mad-auto-refresh-in-seconds="20"`
| `data-mad-auto-refresh-limit` | Optional. Set a limit for the auto refresh | `data-mad-auto-refresh-limit="3"`
| `data-mad-lazyload-offset` | Optional. Enables lazy load functionality when the chosen offset (in pixels) is reached | `data-mad-lazyload-offset="100"`

Also, your madOptions should be:

```HTML
<script>
    var madOptions = {
        SmartAdServer: {
            siteId: 12345,
            pageId: 123456,
            formatId: '20055,20056,28234',        
            target: 'tag1;tag2;',
        };
</script>
```
