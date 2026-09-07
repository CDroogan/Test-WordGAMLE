import { useRef, useCallback } from 'react';

// Lets a mouse click-and-drag horizontally through a row that already
// scrolls via touch/trackpad swipe, for desktop users with no
// touchscreen and no visible scrollbar to grab.
export default function useDragScroll() {
    const ref = useRef(null);
    const state = useRef({ isDown: false, startX: 0, startScrollLeft: 0, moved: false });

    const onMouseDown = useCallback((e) => {
        const el = ref.current;
        if (!el) return;
        state.current.isDown = true;
        state.current.moved = false;
        state.current.startX = e.pageX;
        state.current.startScrollLeft = el.scrollLeft;
    }, []);

    const endDrag = useCallback(() => {
        state.current.isDown = false;
    }, []);

    const onMouseMove = useCallback((e) => {
        const el = ref.current;
        if (!el || !state.current.isDown) return;
        const delta = e.pageX - state.current.startX;
        if (Math.abs(delta) > 3) state.current.moved = true;
        el.scrollLeft = state.current.startScrollLeft - delta;
    }, []);

    // A drag that actually moved the row shouldn't also register as a
    // click on whatever button the cursor lands on.
    const onClickCapture = useCallback((e) => {
        if (state.current.moved) {
            e.preventDefault();
            e.stopPropagation();
            state.current.moved = false;
        }
    }, []);

    return {
        dragScrollRef: ref,
        dragScrollHandlers: {
            onMouseDown,
            onMouseMove,
            onMouseUp: endDrag,
            onMouseLeave: endDrag,
            onClickCapture,
        },
    };
}
