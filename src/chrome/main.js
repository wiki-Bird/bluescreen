// Use browser or chrome API depending on the environment
const extensionApi = (typeof browser !== 'undefined') ? browser : chrome;

function getCheckboxStates() {
  return new Promise((resolve, reject) => {
    extensionApi.storage.local.get(['hideFeed', 'hideReplies'], result => {
      if (extensionApi.runtime.lastError) {
        reject(extensionApi.runtime.lastError);
      } else {
        resolve({
          hideFeed: result.hideFeed,
          hideReplies: result.hideReplies
        });
      }
    });
  }).catch(error => {
    console.error('Error retrieving checkbox states:', error);
    return {
      hideFeed: false,
      hideReplies: false
    };
  });
}

function removeVerifiedTweetsAndReplies() {
  // Select the timelines for replies and home feed
  const repliesTimeline = document.querySelector('[aria-label="Timeline: Conversation"]');
  const homeTimeline = document.querySelector('[aria-label="Timeline: Your Home Timeline"]');

  function removeVerifiedFromTimeline(timeline, timelineName) {
    if (!timeline) {
      return;
    }
    const verifiedBadges = timeline.querySelectorAll('[aria-label="Verified account"]');
  
    verifiedBadges.forEach((verifiedBadge, index) => {
      let tweetElement = verifiedBadge.closest('[data-testid="cellInnerDiv"]');
      if (tweetElement) {
        // Check if this is the first cellInnerDiv in its parent
        const parent = tweetElement.parentElement;
        const isFirstCell = parent.firstElementChild === tweetElement;
  
        if (!isFirstCell || timelineName != "Replies") {
          tweetElement.style.visibility = 'hidden';
          tweetElement.style.height = '0';
          tweetElement.style.margin = '0';
          tweetElement.style.padding = '0';
        } else {
          log(`Skipping hiding of first cellInnerDiv in ${timelineName} timeline`);
        }
      } else {
        log(`Could not find parent cellInnerDiv for verified badge ${index + 1} in ${timelineName} timeline`);
      }
    });
  }

  function handleCheckboxStates() {
    getCheckboxStates().then(checkboxStates => {
      if (checkboxStates.hideReplies) removeVerifiedFromTimeline(repliesTimeline, "Replies");
      if (checkboxStates.hideFeed) removeVerifiedFromTimeline(homeTimeline, "Home");
    }).catch(error => {
      console.error('Error handling checkbox states:', error);
    });
  }

  handleCheckboxStates();
}

// Function to set up the MutationObserver
function setupObserver() {
  const targetNode = document.body;
  const config = { childList: true, subtree: true };

  const callback = function(mutationsList, observer) {
    for(let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        removeVerifiedTweetsAndReplies();
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}

function log(message) {
  console.log(`[Hide Verified Tweets] ${message}`);
}

// Run the setup when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupObserver);
} else {
  setupObserver();
}