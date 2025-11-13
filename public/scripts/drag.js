// Get Device Type by creating touch event
const deviceType = 'ontouchstart' in document.documentElement ? 'touch' : 'mouse';

const events = {
    mouse: {
        down: 'mousedown',
        up: 'mouseup',
        move: 'mousemove',
    },
    touch: {
        down: 'touchstart',
        up: 'touchend',
        move: 'touchmove',
    }
}

let topZIndex = 100;

document.querySelectorAll('.drag_item').forEach((item) => {


    const dragItem = {
        position: [0, 0],
        element: item,
        moving: false,
    }


    dragItem.element.addEventListener(events[deviceType].down, (e) => {
        e.preventDefault();

        dragItem.moving = true;

        if (deviceType === 'touch')
            dragItem.position = [e.touches[0].clientX, e.touches[0].clientY];
        else
            dragItem.position = [e.clientX, e.clientY];

        topZIndex += 10
        dragItem.element.style.zIndex = topZIndex;


    }
    );

    dragItem.element.addEventListener(events[deviceType].move, (e) => {
        e.preventDefault();

        if (dragItem.moving) {
            if (deviceType === 'touch') {
                dragItem.element.style.left = `${dragItem.element.offsetLeft + e.touches[0].clientX - dragItem.position[0]}px`;
                dragItem.element.style.top = `${dragItem.element.offsetTop + e.touches[0].clientY - dragItem.position[1]}px`;

                dragItem.position = [e.touches[0].clientX, e.touches[0].clientY];
            }
            else {
                dragItem.element.style.left = `${dragItem.element.offsetLeft + e.clientX - dragItem.position[0]}px`;
                dragItem.element.style.top = `${dragItem.element.offsetTop + e.clientY - dragItem.position[1]}px`;

                dragItem.position = [e.clientX, e.clientY];
            }
        }

    }
    );

    dragItem.element.addEventListener(events[deviceType].up, (e) => {
        e.preventDefault();

        dragItem.moving = false;
        dragItem.position = [0, 0];

    }
    );

});



const items = document.querySelectorAll('.drag_item');

// ---- 1. Create a <style> element (once) ----
const styleEl = document.createElement('style');
document.head.appendChild(styleEl);
const sheet = styleEl.sheet;

// ---- 2. Helper: insert a rule ----
const addRule = (selector, decl) => {
    try { sheet.insertRule(`${selector}{${decl}}`, sheet.cssRules.length); }
    catch (e) { console.warn('CSS rule error', e); }
};

// ---- 3. Generate per‑item transforms ----
items.forEach((item, i) => {
    const nth = i + 1;                     // 1‑based for :nth-child
    const total = items.length;

    // ---- rotation & offset (feel free to tweak) ----
    const sign = (i % 2 === 0) ? 1 : -1;               // alternate direction
    const angle = sign * (5 + (i % 5) * 2);            // 5,7,9,11,… or negative
    const offsetX = (i % 3 - 1) * 22;                   // -22, 0, +22
    const offsetY = (i % 4 - 2) * 18;                   // -36,-18,0,+18
    const z = total - i;                          // newest on top

    const transform = `translate(-50%,-50%) translate(${offsetX}px,${offsetY}px) rotate(${angle}deg)`;

    addRule(
        `.drag_item:nth-child(${nth})`,
        `transform:${transform};z-index:${z};`
    );

    // ---- optional: make photo a bit larger & tilted ----
    if (item.classList.contains('photo-item')) {
        addRule(
            `.drag_item:nth-child(${nth})`,
            `transform:${transform} scale(1.05);padding:12px;`
        );
    }
});