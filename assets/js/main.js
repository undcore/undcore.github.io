// nav 항목은 여기서만 관리합니다. 모든 페이지의 header는 이 파일이 그립니다.
const NAV_ITEMS = [
  { label: 'Home', href: 'index.html' },
  { label: 'Projects', href: 'pages/projects.html' },
  { label: 'Algorithm', href: 'pages/algorithm.html' },
  { label: 'GitHub ↗', href: 'https://github.com/undcore', external: true },
  { label: 'Blog ↗', href: 'https://rungch.tistory.com', external: true },
];

const inPagesDirectory = window.location.pathname.includes('/pages/');
const basePath = inPagesDirectory ? '../' : './';
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

const navigationLinksMarkup = NAV_ITEMS.map(function (item) {
  const href = item.external ? item.href : basePath + item.href;
  const isActive = !item.external && item.href.endsWith(currentPage);
  const externalAttributes = item.external ? ' target="_blank" rel="noreferrer"' : '';
  return '<a' + (isActive ? ' class="active"' : '') + ' href="' + href + '"' + externalAttributes + '>' + item.label + '</a>';
}).join('');

const siteHeader = document.querySelector('.site-header');
siteHeader.innerHTML =
  '<a class="wordmark" href="' + basePath + 'index.html">undcore<span>.</span></a>' +
  '<button class="menu-button" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>' +
  '<nav id="site-nav" class="site-nav" aria-label="주요 메뉴">' + navigationLinksMarkup + '</nav>';

const menuButton = siteHeader.querySelector('.menu-button');
const siteNavigation = siteHeader.querySelector('.site-nav');
const navigationLinks = siteHeader.querySelectorAll('.site-nav a');

menuButton.addEventListener('click', function () {
  const isMenuOpen = siteNavigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isMenuOpen));
});

navigationLinks.forEach(function (navigationLink) {
  navigationLink.addEventListener('click', function () {
    siteNavigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

const yearElement = document.querySelector('#year');
if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}
