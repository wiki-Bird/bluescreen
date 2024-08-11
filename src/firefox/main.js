// Use browser or chrome API depending on the environment
const extensionApi = (typeof browser !== 'undefined') ? browser : chrome;

function getCheckboxStates() {
  return new Promise((resolve, reject) => {
    extensionApi.storage.local.get(['hideFeed', 'hideReplies', 'hideAds'], result => {
      if (extensionApi.runtime.lastError) {
        reject(extensionApi.runtime.lastError);
      } else {
        resolve({
          hideFeed: result.hideFeed,
          hideReplies: result.hideReplies,
          hideAds: result.hideAds
        });
      }
    });
  }).catch(error => {
    console.error('Error retrieving checkbox states:', error);
    return {
      hideFeed: false,
      hideReplies: false,
      hideAds: false
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
      // log(`removing replies ${checkboxStates.hideFeed}`);
    }).catch(error => {
      console.error('Error handling checkbox states:', error);
    });
  }

  handleCheckboxStates();
}

// Function to remove ads from sidebar and profile
function removeExtraContent() {
  function removeAds() {
    const sidebarPremium = document.querySelector('[data-testid="premium-signup-tab"]');
    const sidebarGrok  = document.querySelector('[aria-label="Grok"]');
    const profileGetVerified = document.querySelector('[href="/i/premium_sign_up"]');
    const subToPremiumRightside = document.querySelector('[aria-label="Subscribe to Premium"]');

    if (sidebarPremium) {
      sidebarPremium.remove();
    }
    if (sidebarGrok) {
      sidebarGrok.remove();
    }
    if (profileGetVerified) {
      profileGetVerified.remove();
    }
    if (subToPremiumRightside.parentNode) {
      subToPremiumRightside.parentNode.remove();
    }
  }

  function handleCheckboxStates() {
    getCheckboxStates().then(checkboxStates => {
      if (checkboxStates.hideAds) removeAds();
    }).catch(error => {
      console.error('Error handling checkbox states:', error);
    });
  }
  handleCheckboxStates();
}

// Function to set up the MutationObserver
function setupObserver() {
  const targetNode = document.querySelector('[id="react-root"]');

  const config = { childList: true, subtree: true };

  const callback = function(mutationsList, observer) {
    for(let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        removeVerifiedTweetsAndReplies();
        removeExtraContent();
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