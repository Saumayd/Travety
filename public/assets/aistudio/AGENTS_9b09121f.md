<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Welcome-only layout, preference-menu composition, and additional translations stay in the index route and reuse shared providers/primitives so other screens are unchanged.
- Guest preview is a tab-scoped UI flag, separate from the real auth session; it permits app-shell browsing but never supplies credentials or bypasses database access checks.
- The demo-state context lives in a separate non-component module so preview hot updates keep provider and consumer context identity consistent.
