# Prebid.js SmartAdserver plugin

This plugin supports the same parameters as our [SmartAdserver plugin](/docs/smartadserver.md).

Remember, molotov-ads does not load the SmartAdserver library. It's your responsibility to load it in your page.

You will also have to load the prebid.js code on your page.

Your madOptions should be:

```HTML
<script>
    var madOptions = {
        PrebidSmart: {
            siteId: 12345,
            pageId: 123456,
            formatId: '20055,20056,28234',        
            target: 'target1;target2;',
            PREBID_TIMEOUT: 1000,
            sendAllBids: true,
            logBids: true,
            adUnits: [{}]
        }
    };
</script>
```
