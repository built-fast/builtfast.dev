// Add anchor links to prose headings for easy linking
document.querySelectorAll('.prose h2[id], .prose h3[id], .prose h4[id]').forEach(heading => {
  const anchor = document.createElement('a');
  anchor.href = '#' + heading.id;
  anchor.innerHTML = heading.innerHTML;
  heading.innerHTML = '';
  heading.appendChild(anchor);
});
