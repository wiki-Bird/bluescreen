// Use browser or chrome API depending on the environment
const browserApi = (typeof browser !== 'undefined') ? browser : chrome;
const logoImage = document.getElementById('logo-image');

function saveCheckboxState() {
  // const hideFollowingCheckbox = document.getElementById('hideFollowing');
  const hideFeedCheckbox = document.getElementById('hideFeed');
  const hideRepliesCheckbox = document.getElementById('hideReplies');
  const hideAdsCheckbox = document.getElementById('hideAds');

  browserApi.storage.local.set({
    // hideFollowing: hideFollowingCheckbox.checked,
    hideFeed: hideFeedCheckbox.checked,
    hideReplies: hideRepliesCheckbox.checked,
    hideAds: hideAdsCheckbox.checked
  }, function () {
  });
}

function restoreCheckboxState() {
  browserApi.storage.local.get({
    hideFollowing: false,
    hideFeed: false,
    hideReplies: false,
    hideAds: false
  }, function(items) {
    // const hideFollowingCheckbox = document.getElementById('hideFollowing');
    const hideFeedCheckbox = document.getElementById('hideFeed');
    const hideRepliesCheckbox = document.getElementById('hideReplies');
    const hideAdsCheckbox = document.getElementById('hideAds');

    // hideFollowingCheckbox.checked = items.hideFollowing;
    hideFeedCheckbox.checked = items.hideFeed;
    hideRepliesCheckbox.checked = items.hideReplies;
    hideAdsCheckbox.checked = items.hideAds;
  });
}

// function getBlockedCount() {
//   browserApi.storage.local.get({
//     blockedCount: 0
//   }, function(items) {
//     const blockedCount = items.blockedCount;
//     const blockedCountElement = document.getElementById('blocked-count');
//     blockedCountElement.textContent = blockedCount;
//   });
// }

function updateBlockedCountDisplay() {
  browserApi.storage.local.get({ blockedCount: 0 }, (result) => {
    const blockedCountElement = document.getElementById('blocked-count');
    const infoContainer = document.querySelector('.info-container');
    const scrollingText = document.querySelector('.scrolling-text');
    
    blockedCountElement.textContent = result.blockedCount;
    
    // Check if scrolling is necessary
    if (scrollingText.offsetWidth > infoContainer.offsetWidth) {
      scrollingText.style.animation = 'scroll-left 15s linear infinite';
    } else {
      scrollingText.style.animation = 'none';
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  // Restore the checkbox states when the popup is opened
  restoreCheckboxState();
  updateBlockedCountDisplay();

  // Attach event listeners to checkboxes to save state on change
  // const hideFollowingCheckbox = document.getElementById('hideFollowing');
  const hideFeedCheckbox = document.getElementById('hideFeed');
  const hideRepliesCheckbox = document.getElementById('hideReplies');
  const hideAdsCheckbox = document.getElementById('hideAds');
  const logoImage = document.getElementById('logo-image');

  // hideFollowingCheckbox.addEventListener('change', saveCheckboxState);
  hideFeedCheckbox.addEventListener('change', saveCheckboxState);
  hideRepliesCheckbox.addEventListener('change', saveCheckboxState);
  hideAdsCheckbox.addEventListener('change', saveCheckboxState);

  let bCount = 0;
  document.addEventListener('keyup', (event) => {
    if (event.key === 'b' || event.key === 'B') {
      bCount++;
      if (bCount === 3) {
        logoImage.src = 'images/logo/bigbear.png';
        bCount = 0;
        // hide blocked-count-text show version
        document.getElementById('blocked-count-text').style.display = 'none';
        document.getElementById('version').style.display = 'block';
      }
    } else {
      bCount = 0; 
    }
  });
});

