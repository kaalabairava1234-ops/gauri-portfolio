# Updating the site

This is Gauri Tichkule's personal portfolio. Most updates are content changes, and they all happen in one place.

## Change the words

Every fact on the site comes from the CV and lives in `src/lib/content.ts`: roles, metrics, case studies, education, skills and leadership. Edit it there and both pages update together. The story's own lines (hero, about, toolkits, timeline beats) are near the top of each scene in `src/routes/index.tsx`.

Keep it accurate: only numbers and claims that appear on the CV, each with its original meaning. Case-study visuals are illustrative and labelled that way; don't replace them with client material.

## Update the CV

Replace `public/Gauri_Tichkule_CV.pdf` with the new file under the same name. Every "Download CV" link points to it.

## Add LinkedIn or a domain

- LinkedIn: set `LINKEDIN_URL` in `src/lib/content.ts`.
- Domain: set `SITE_URL` in `src/lib/seo.ts` and update `public/sitemap.xml`, `public/robots.txt` and `public/llms.txt`.

## Check before publishing

```sh
npm install
npm run dev     # look at it on a phone width and a laptop width
npm run build   # must succeed
```

For anything visual, check it at 375px, 768px and 1366px wide, and with reduced motion switched on in the operating system.

## Credits

Built on [SomehowLiving/portfolio-template](https://github.com/SomehowLiving/portfolio-template) by Nidhi Prajapati, MIT-licensed (see `LICENSE`).
