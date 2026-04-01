const tabButtons = document.querySelectorAll("[data-tab]");
const tabPanels = document.querySelectorAll("[data-panel]");

for (const button of tabButtons) {
  button.addEventListener("click", () => {
    const target = button.dataset.tab;

    for (const currentButton of tabButtons) {
      const isActive = currentButton === button;
      currentButton.classList.toggle("is-active", isActive);
      currentButton.setAttribute("aria-selected", String(isActive));
    }

    for (const panel of tabPanels) {
      const isActive = panel.dataset.panel === target;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    }
  });
}

const sortableTables = document.querySelectorAll("[data-sort-table]");

for (const table of sortableTables) {
  const tbody = table.querySelector("tbody");
  const sortButtons = table.querySelectorAll("[data-sort-column]");

  if (!tbody || sortButtons.length === 0) {
    continue;
  }

  const sortTable = (columnIndex, direction) => {
    const rows = Array.from(tbody.querySelectorAll("tr"));

    rows.sort((rowA, rowB) => {
      const valueA = rowA.children[columnIndex]?.textContent?.trim().toLowerCase() ?? "";
      const valueB = rowB.children[columnIndex]?.textContent?.trim().toLowerCase() ?? "";
      return valueA.localeCompare(valueB, undefined, { numeric: true }) * direction;
    });

    tbody.replaceChildren(...rows);
  };

  for (const button of sortButtons) {
    button.addEventListener("click", () => {
      const columnIndex = Number(button.dataset.sortColumn);
      const nextDirection = button.dataset.sortDirection === "asc" ? "desc" : "asc";
      const direction = nextDirection === "asc" ? 1 : -1;

      for (const currentButton of sortButtons) {
        currentButton.dataset.sortDirection = "";
        currentButton.removeAttribute("aria-sort");
        currentButton.classList.remove("is-active");
      }

      button.dataset.sortDirection = nextDirection;
      button.setAttribute("aria-sort", nextDirection === "asc" ? "ascending" : "descending");
      button.classList.add("is-active");
      sortTable(columnIndex, direction);
    });
  }

  const defaultButton = table.querySelector("[data-sort-default]") || sortButtons[0];
  if (defaultButton instanceof HTMLElement) {
    defaultButton.dataset.sortDirection = "desc";
    defaultButton.click();
  }
}

const albumCarousel = document.querySelector("[data-album-carousel]");

if (albumCarousel instanceof HTMLElement) {
  const albumChoiceKey = "funkyRusticAlbumChoice";
  const albumChoiceTtlMs = 60 * 60 * 1000;
  const prevButton = albumCarousel.querySelector("[data-album-prev]");
  const nextButton = albumCarousel.querySelector("[data-album-next]");
  const image = albumCarousel.querySelector("[data-album-image]");
  const imageLink = albumCarousel.querySelector("[data-album-image-link]");
  const title = albumCarousel.querySelector("[data-album-title]");
  const link = albumCarousel.querySelector("[data-album-link]");
  const dots = albumCarousel.querySelector("[data-album-dots]");
  const slide = albumCarousel.querySelector("[data-album-slide]");
  const fallback = albumCarousel.querySelector("[data-album-fallback]");

  let albums = [];
  let currentIndex = 0;
  let touchStartX = 0;

  const persistAlbumChoice = () => {
    try {
      localStorage.setItem(
        albumChoiceKey,
        JSON.stringify({
          index: currentIndex,
          savedAt: Date.now(),
        })
      );
    } catch {}
  };

  const getInitialAlbumIndex = () => {
    try {
      const rawChoice = localStorage.getItem(albumChoiceKey);
      if (!rawChoice) {
        return Math.floor(Math.random() * albums.length);
      }

      const parsedChoice = JSON.parse(rawChoice);
      const savedAt = Number(parsedChoice?.savedAt);
      const storedIndex = Number(parsedChoice?.index);
      const isFresh = Number.isFinite(savedAt) && Date.now() - savedAt < albumChoiceTtlMs;
      const isValidIndex = Number.isInteger(storedIndex) && storedIndex >= 0 && storedIndex < albums.length;

      if (isFresh && isValidIndex) {
        return storedIndex;
      }
    } catch {}

    return Math.floor(Math.random() * albums.length);
  };

  const renderDots = () => {
    if (!(dots instanceof HTMLElement)) {
      return;
    }

    dots.replaceChildren(
      ...albums.map((album, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "album-dot";
        if (index === currentIndex) {
          dot.classList.add("is-active");
        }
        dot.setAttribute("aria-label", `Show album ${index + 1}: ${album.title}`);
        dot.addEventListener("click", () => {
          currentIndex = index;
          persistAlbumChoice();
          renderAlbum();
        });
        return dot;
      })
    );
  };

  const setAlbumUnavailable = () => {
    albumCarousel.classList.add("is-unavailable");

    if (fallback instanceof HTMLElement) {
      fallback.hidden = false;
    }

    if (title instanceof HTMLElement) {
      title.textContent = "Album spotlight unavailable";
    }

    if (image instanceof HTMLImageElement) {
      image.removeAttribute("src");
      image.alt = "";
    }

    if (imageLink instanceof HTMLAnchorElement) {
      imageLink.removeAttribute("href");
      imageLink.setAttribute("aria-disabled", "true");
    }

    if (link instanceof HTMLAnchorElement) {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
    }

    if (prevButton instanceof HTMLButtonElement) {
      prevButton.disabled = true;
    }

    if (nextButton instanceof HTMLButtonElement) {
      nextButton.disabled = true;
    }
  };

  const renderAlbum = () => {
    const album = albums[currentIndex];
    if (!album) {
      return;
    }

    if (slide instanceof HTMLElement) {
      slide.classList.remove("is-active");
      requestAnimationFrame(() => slide.classList.add("is-active"));
    }

    if (image instanceof HTMLImageElement) {
      image.src = album.image;
      image.alt = album.imageAlt || album.title;
    }

    if (imageLink instanceof HTMLAnchorElement) {
      imageLink.href = album.link;
      imageLink.setAttribute("aria-label", `Open ${album.title} on Bandcamp`);
    }

    if (title instanceof HTMLElement) {
      title.textContent = album.title;
    }

    if (link instanceof HTMLAnchorElement) {
      link.href = album.link;
    }

    persistAlbumChoice();
    renderDots();
  };

  const stepAlbum = (direction) => {
    if (albums.length === 0) {
      return;
    }

    currentIndex = (currentIndex + direction + albums.length) % albums.length;
    renderAlbum();
  };

  if (prevButton instanceof HTMLElement) {
    prevButton.addEventListener("click", () => stepAlbum(-1));
  }

  if (nextButton instanceof HTMLElement) {
    nextButton.addEventListener("click", () => stepAlbum(1));
  }

  if (slide instanceof HTMLElement) {
    slide.addEventListener("touchstart", (event) => {
      touchStartX = event.changedTouches[0]?.clientX ?? 0;
    });

    slide.addEventListener("touchend", (event) => {
      const touchEndX = event.changedTouches[0]?.clientX ?? 0;
      const delta = touchEndX - touchStartX;

      if (Math.abs(delta) < 40) {
        return;
      }

      stepAlbum(delta < 0 ? 1 : -1);
    });
  }

  fetch("albums.json")
    .then((response) => response.json())
    .then((data) => {
      if (!Array.isArray(data) || data.length === 0) {
        setAlbumUnavailable();
        return;
      }

      albums = data;
      currentIndex = getInitialAlbumIndex();
      renderAlbum();
    })
    .catch(() => {
      setAlbumUnavailable();
    });
}
