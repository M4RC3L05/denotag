import type { FunctionalComponent } from "preact";

export const ErrorDialogFragment: FunctionalComponent<{ error?: Error }> = (
  { error },
) => {
  return (
    <div
      id="error-dialog"
      class="backdrop-dialog show"
      hx-swap-oob="true"
      onclick={"document.getElementById('error-dialog').classList.add('hidden');document.getElementById('error-dialog').classList.remove('show')"}
    >
      <dialog open onclick={"event.stopPropagation()"}>
        <h2>Server error</h2>
        {error ? <pre>{JSON.stringify(error, null, 2)}</pre> : null}
        <button
          onclick={"event.stopPropagation();document.getElementById('error-dialog').classList.add('hidden');document.getElementById('error-dialog').classList.remove('show')"}
        >
          Close
        </button>
      </dialog>
    </div>
  );
};
