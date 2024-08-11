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

document.addEventListener('DOMContentLoaded', function () {
  // Restore the checkbox states when the popup is opened
  restoreCheckboxState();

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
      }
    } else {
      bCount = 0; 
    }
  });
});

