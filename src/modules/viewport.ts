export module Viewport {
    export function isElementInViewport(element: HTMLElement, threshold: number) {
        const rect = element.getBoundingClientRect();

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom - threshold <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    export function isElementVisible(element: HTMLElement) {
        return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    }

    export function getCurrentViewabilityPercentage(element: HTMLElement) {
        var rectTop = element.getBoundingClientRect().top;

        var top = rectTop > 0 ? window.innerHeight - rectTop : Math.abs(rectTop);

        var result = top / element.clientHeight;

        result = rectTop > 0 ? result : 1 - result;

        if (result < 0) result = 0;
        if (result > 1) result = 1;

        return result * 100;
    }
}
