"use client";

import type { ComponentProps } from "react";

/** Liste déroulante qui soumet son formulaire dès qu'on change de valeur. */
export function AutoSubmitSelect(props: ComponentProps<"select">) {
  return (
    <select
      {...props}
      onChange={(event) => {
        props.onChange?.(event);
        event.currentTarget.form?.requestSubmit();
      }}
    />
  );
}
