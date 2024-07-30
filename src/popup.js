// Use browser or chrome API depending on the environment
const browserApi = (typeof browser !== 'undefined') ? browser : chrome;

function saveCheckboxState() {
  const hideFollowingCheckbox = document.getElementById('hideFollowing');
  const hideFeedCheckbox = document.getElementById('hideFeed');
  const hideRepliesCheckbox = document.getElementById('hideReplies');

  browserApi.storage.local.set({
    hideFollowing: hideFollowingCheckbox.checked,
    hideFeed: hideFeedCheckbox.checked,
    hideReplies: hideRepliesCheckbox.checked
  }, function () {
  });
}

function restoreCheckboxState() {
  browserApi.storage.local.get({
    hideFollowing: false,
    hideFeed: false,
    hideReplies: false
  }, function(items) {
    const hideFollowingCheckbox = document.getElementById('hideFollowing');
    const hideFeedCheckbox = document.getElementById('hideFeed');
    const hideRepliesCheckbox = document.getElementById('hideReplies');

    hideFollowingCheckbox.checked = items.hideFollowing;
    hideFeedCheckbox.checked = items.hideFeed;
    hideRepliesCheckbox.checked = items.hideReplies;
  });
}

document.addEventListener('DOMContentLoaded', function () {
  // Restore the checkbox states when the popup is opened
  restoreCheckboxState();

  // Attach event listeners to checkboxes to save state on change
  const hideFollowingCheckbox = document.getElementById('hideFollowing');
  const hideFeedCheckbox = document.getElementById('hideFeed');
  const hideRepliesCheckbox = document.getElementById('hideReplies');

  hideFollowingCheckbox.addEventListener('change', saveCheckboxState);
  hideFeedCheckbox.addEventListener('change', saveCheckboxState);
  hideRepliesCheckbox.addEventListener('change', saveCheckboxState);
});