import { signal, useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

export interface Ripple {
    x: number;
    y: number;
    id: number;
}

export function useRipple() {
    const ripples = useSignal<Ripple[]>([]);

    const addRipple = (e: MouseEvent | TouchEvent) => {
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        let clientX, clientY;
        if (e instanceof MouseEvent) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const id = Date.now();

        ripples.value = [...ripples.value, { x, y, id }];

        // Clean up ripple after animation
        setTimeout(() => {
            ripples.value = ripples.value.filter((r) => r.id !== id);
        }, 600);
    };

    return { ripples, addRipple };
}
