/** A labelled external link. */
export type SiteLink = { label: string; href: string };

/** Site-wide details. */
export type SiteInfo = {
  name: string;
  description: string;
  email: string;
  github: string;
  /** File name of the CV under public/. /cv redirects there (see astro.config.mjs). */
  cv: string;
  /** Extra links shown after Email on the home page. */
  extraLinks: SiteLink[];
};

/** The values used across the site. */
export const site: SiteInfo = {
  name: 'Christine Ng',
  description: 'Portfolio of Christine Ng, computer science student at the University of Washington.',
  email: 'christineng2004@gmail.com',
  github: 'https://github.com/ChristineNg2027',
  cv: 'christine-ng-cv.pdf',
  extraLinks: [{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/christineng2027/' }],
};
