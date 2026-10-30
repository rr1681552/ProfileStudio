const form = document.getElementById("profileForm");
const nameInput = document.getElementById("name");
const roleInput = document.getElementById("role");
const bioInput = document.getElementById("bio");
const skillsInput = document.getElementById("skills");
const avatarInput = document.getElementById("avatar");
const githubInput = document.getElementById("github");
const linkedinInput = document.getElementById("linkedin");
const websiteInput = document.getElementById("website");

const previewName = document.getElementById("previewName");
const previewRole = document.getElementById("previewRole");
const previewBio = document.getElementById("previewBio");
const previewAvatar = document.getElementById("previewAvatar");
const previewSkills = document.getElementById("previewSkills");
const previewSocial = document.getElementById("previewSocial");

const bioCount = document.getElementById("bioCount");
const savedProfiles = document.getElementById("savedProfiles");
const savedCount = document.getElementById("savedCount");
const saveBtn = document.getElementById("saveBtn");
const toast = document.getElementById("toast");

let toastTimer;
let currentProfiles = [];

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.classList.toggle("error", isError);
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function getSkills() {
  return [...new Set(
    skillsInput.value
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean)
  )].slice(0, 20);
}

function safeHttpUrl(value) {
  if (!value) return "";

  try {
    const url = new URL(value.trim());

    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.href;
    }
  } catch (error) {
    return "";
  }

  return "";
}

function makeAvatar(url, name) {
  const safeUrl = url ? safeHttpUrl(url) : "";

  if (safeUrl) {
    const img = document.createElement("img");
    img.src = safeUrl;
    img.alt = `${name || "Profile"} avatar`;
    img.referrerPolicy = "no-referrer";

    img.addEventListener("error", () => {
      previewAvatar.textContent = (name || "Y").charAt(0).toUpperCase();
    }, { once: true });

    previewAvatar.replaceChildren(img);
  } else {
    previewAvatar.textContent = (name || "Y").charAt(0).toUpperCase();
  }
}

function renderSkills(skills) {
  previewSkills.replaceChildren();

  if (!skills.length) {
    const empty = document.createElement("span");
    empty.className = "empty-skills";
    empty.textContent = "Your skills will appear here";
    previewSkills.appendChild(empty);
    return;
  }

  skills.forEach((skill) => {
    const chip = document.createElement("span");
    chip.className = "skill-chip";
    chip.textContent = skill;
    previewSkills.appendChild(chip);
  });
}

function renderSocialLinks(profile) {
  previewSocial.replaceChildren();

  const links = [
    { label: "GitHub", icon: "⌘", url: profile.github },
    { label: "LinkedIn", icon: "in", url: profile.linkedin },
    { label: "Website", icon: "↗", url: profile.website }
  ].filter((item) => item.url);

  if (!links.length) {
    const empty = document.createElement("span");
    empty.className = "empty-social";
    empty.textContent = "Your social links will appear here";
    previewSocial.appendChild(empty);
    return;
  }

  links.forEach((item) => {
    const link = document.createElement("a");
    link.className = "social-link";
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `${item.icon} ${item.label}`;
    previewSocial.appendChild(link);
  });
}

function getFormProfile() {
  return {
    name: nameInput.value.trim(),
    role: roleInput.value.trim(),
    bio: bioInput.value.trim(),
    skills: getSkills(),
    avatar: safeHttpUrl(avatarInput.value),
    github: safeHttpUrl(githubInput.value),
    linkedin: safeHttpUrl(linkedinInput.value),
    website: safeHttpUrl(websiteInput.value)
  };
}

function updatePreview() {
  const profile = getFormProfile();

  previewName.textContent = profile.name || "Your Name";
  previewRole.textContent = profile.role || "Your role goes here";

  previewBio.textContent = profile.bio ||
    "Your story starts here. Add a short introduction to let the world know what makes you unique.";

  bioCount.textContent = `${bioInput.value.length} / 500`;

  makeAvatar(profile.avatar, profile.name);
  renderSkills(profile.skills);
  renderSocialLinks(profile);
}

[
  nameInput,
  roleInput,
  bioInput,
  skillsInput,
  avatarInput,
  githubInput,
  linkedinInput,
  websiteInput
].forEach((input) => {
  input.addEventListener("input", updatePreview);
});

function createSavedProfileCard(profile) {
  const card = document.createElement("article");
  card.className = "saved-card";

  const top = document.createElement("div");
  top.className = "saved-card-top";

  const avatar = document.createElement("div");
  avatar.className = "saved-avatar";

  const avatarUrl = safeHttpUrl(profile.avatar);

  if (avatarUrl) {
    const img = document.createElement("img");
    img.src = avatarUrl;
    img.alt = "";
    img.referrerPolicy = "no-referrer";

    img.addEventListener("error", () => {
      avatar.textContent = (profile.name || "Y").charAt(0).toUpperCase();
    }, { once: true });

    avatar.appendChild(img);
  } else {
    avatar.textContent = (profile.name || "Y").charAt(0).toUpperCase();
  }

  const person = document.createElement("div");
  person.className = "saved-person";

  const personName = document.createElement("h3");
  personName.textContent = profile.name || "Unnamed profile";

  const personRole = document.createElement("p");
  personRole.textContent = profile.role || "No role added";

  person.append(personName, personRole);
  top.append(avatar, person);

  const actions = document.createElement("div");
  actions.className = "saved-card-actions";

  const viewButton = document.createElement("button");
  viewButton.type = "button";
  viewButton.className = "small-button";
  viewButton.textContent = "View / Edit";

  viewButton.addEventListener("click", () => {
    nameInput.value = profile.name || "";
    roleInput.value = profile.role || "";
    bioInput.value = profile.bio || "";
    skillsInput.value = Array.isArray(profile.skills)
      ? profile.skills.join(", ")
      : "";
    avatarInput.value = profile.avatar || "";
    githubInput.value = profile.github || "";
    linkedinInput.value = profile.linkedin || "";
    websiteInput.value = profile.website || "";

    updatePreview();
    document.getElementById("editor").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    showToast("Profile loaded into the editor.");
  });

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "small-button delete";
  deleteButton.textContent = "Delete";

  deleteButton.addEventListener("click", async () => {
    if (!confirm(`Delete the profile for ${profile.name}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/profiles/${encodeURIComponent(profile.id)}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not delete profile.");
      }

      showToast("Profile deleted successfully.");
      await loadProfiles();
    } catch (error) {
      showToast(error.message || "Could not connect to the server.", true);
    }
  });

  actions.append(viewButton, deleteButton);
  card.append(top, actions);

  return card;
}

async function loadProfiles() {
  try {
    const response = await fetch("/api/profiles");

    if (!response.ok) {
      throw new Error("Could not load saved profiles.");
    }

    currentProfiles = await response.json();

    savedCount.textContent =
      `${currentProfiles.length} ${currentProfiles.length === 1 ? "profile" : "profiles"}`;

    savedProfiles.replaceChildren();

    if (currentProfiles.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";

      const icon = document.createElement("div");
      icon.className = "empty-state-icon";
      icon.textContent = "▤";

      const heading = document.createElement("h3");
      heading.textContent = "No profiles yet";

      const description = document.createElement("p");
      description.textContent =
        "Create your first profile and click “Save profile”.";

      empty.append(icon, heading, description);
      savedProfiles.appendChild(empty);
      return;
    }

    currentProfiles.forEach((profile) => {
      savedProfiles.appendChild(createSavedProfileCard(profile));
    });
  } catch (error) {
    savedCount.textContent = "Unavailable";
    showToast("Cannot load profiles. Is the server running?", true);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const profile = getFormProfile();

  if (!profile.name) {
    showToast("Please enter your full name.", true);
    nameInput.focus();
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  try {
    const response = await fetch("/api/profiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(profile)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Could not save profile.");
    }

    showToast(result.message || "Profile saved successfully!");
    await loadProfiles();
  } catch (error) {
    showToast(error.message || "Could not connect to the server.", true);
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = "<span>✦</span> Save profile";
  }
});

form.addEventListener("reset", () => {
  setTimeout(() => {
    updatePreview();
    showToast("Form cleared.");
  }, 0);
});

updatePreview();
loadProfiles();
