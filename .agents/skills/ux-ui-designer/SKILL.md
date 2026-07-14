---
name: ux-ui-designer
description: Expert guidelines and design heuristics for conducting visual, interactive, and structural UX/UI audits of web applications, specifically focusing on editorial layout, accessibility, and visual harmony.
---

# UX/UI Design Heuristics & Audit Guidelines

This skill defines the visual, structural, and interactive principles to inspect and design web applications to meet a premium, modern standard. 

Use these rules when evaluating interfaces, reviewing code layouts, or designing new modules.

---

## 1. Visual Hierarchy & Typography
*   **Editorial Contrast**: Pair distinct font weights or styles. For dashboard settings and section titles, use elegant serif fonts (e.g., *Instrument Serif* or *Playfair*) contrasted against clean, geometric sans-serif typefaces (e.g., *Inter* or *Outfit*) for tabular data and body text.
*   **Neutral-Heavy Palettes**: Avoid harsh, saturated primaries. Rely on warm or cool neutral scales (e.g., `slate`, `zinc`, `neutral` at intensities between `50` and `900`) for structural elements, reserving accent colors (e.g., warm clay, sage green, or muted indigo) for key metric tags or interactive states.
*   **Breathing Room (Padding/Margins)**: Prevent dense layouts. Use open grid rows (`gap-8` to `gap-12`) and separation lines (`border-neutral-950/5`) to delineate different blocks cleanly.

---

## 2. Interactive Components & Forms
*   **Micro-interactions**: Interactive buttons and inputs should feel alive. Apply subtle transitions (`transition-colors duration-150`) and small transformations (e.g., tiny active scaling or color shifting on hover).
*   **Currency & Input Alignment**: Financial values should use tabular numbers (`font-mono` or `tabular-nums`) to align digits vertically. Text labels should align left, and numeric values should align right in list or grid items.
*   **Explicit Focus Rings**: Ensure form inputs have distinct focus indicators (`focus-visible:ring-1 focus-visible:ring-neutral-950` or similar offset rings) to guide keyboard navigation and maintain compliance.

---

## 3. Onboarding & Layout Flow
*   **Progressive Disclosure**: Show only what the user needs at the current step. In multi-step forms:
    *   Include a visible step track (e.g., progress bar or dot indicators).
    *   Provide easy options to cancel, go back, or skip to prevent onboarding fatigue.
*   **Real-time Summary Feedback**: If the onboarding accumulates user data (like income, savings, or debt), render a live reactive sidebar or summary card showing the updated values immediately, reinforcing the value proposition of the tool.
*   **Responsive Sidebars**: Ensure sidebars collapse gracefully into bottom bars or sheet panels on screens smaller than `768px` (mobile).

---

## 4. Lazy UI Engineering & Design Efficiency (Adherence to lazy-senior-dev)
*   **Smallest Visual Diff**: Always choose the smallest visual tweak to achieve design alignment. Do not rewrite utility configurations or global stylesheets when a focused, single-component styling correction (e.g., margins, alignment classes, or colors) solves the visual imbalance.
*   **Leverage Existing Primitives**: Do not reinvent components or write custom layout engines from scratch. Prioritize using the project's existing design primitives (e.g., Radix UI primitives, pre-existing shadcn/ui custom components, Tailwind configurations) to preserve structural integrity and prevent duplicate code.
*   **No Speculative Styling**: Do not add visual embellishments or layouts for responsive views, interactions, or future modules that are outside the current scope of the user request. Focus styling efforts strictly on the components and features in active use.
