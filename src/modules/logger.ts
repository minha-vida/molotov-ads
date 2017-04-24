export module Logger {
    var devModeEnabled: boolean = location.hash.indexOf('development') >= 0

    export function log(...items: any[]) {
        if (!devModeEnabled) return;
        console.log.apply(console, items);
    }

    export function logWithTime(...items: any[]) {
        log(getCurrentTimeString(), '->', items.join(' '));
    }

    export function info(...items: any[]) {
        if (!devModeEnabled) return;
        console.info.apply(console, items);
    }

    export function infoWithTime(...items: any[]) {
        info(getCurrentTimeString(), '->', items.join(' '));
    }

    export function warn(...items: any[]) {
        if (!devModeEnabled) return;
        console.warn.apply(console, items);
    }

    export function error(...items: any[]) {
        if (!devModeEnabled) return;
        console.error.apply(console, items);
    }

    export function consoleWelcomeMessage() {
        if (!devModeEnabled) return;
        console.log("%c __       __   ______   _______  \n|  \\     /  \\ /      \\ |       \\ \n| $$\\   /  $$|  $$$$$$\\| $$$$$$$\\\n| $$$\\ /  $$$| $$__| $$| $$  | $$\n| $$$$\\  $$$$| $$    $$| $$  | $$\n| $$\\$$ $$ $$| $$$$$$$$| $$  | $$\n| $$ \\$$$| $$| $$  | $$| $$__/ $$\n| $$  \\$ | $$| $$  | $$| $$    $$\n \\$$      \\$$ \\$$   \\$$ \\$$$$$$$\n\n", "color:red;");
        console.log('%c\nMolotov Ads - Developer Console\n\n', 'color:blue;');
    }

    function getCurrentTimeString() {
        var time = new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds() + '.' + new Date().getMilliseconds();

        return time;
    }
}
