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
      hideFeed: true,
      hideReplies: true,
      hideAds: true
    };
  });
}

function removeVerifiedTweetsAndReplies() {
  let authorName = "";
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

        // Get the username of the author of the original tweet
        if (isFirstCell || timelineName == "Replies") {
          const firstCellUsernameElement = parent.querySelector('[data-testid="cellInnerDiv"]:first-child [href^="/"][role="link"]');
          authorName = firstCellUsernameElement ? firstCellUsernameElement.getAttribute('href').split('/')[1] : null;
        }
  
        if (!isFirstCell || timelineName != "Replies") {
          // Extract the username of the tweet's author
          const usernameElement = tweetElement.querySelector('[href^="/"][role="link"]');
          const username = usernameElement ? usernameElement.getAttribute('href').split('/')[1] : null;
          // Don't hide tweet's from the same author as the first tweet
          if (username === authorName) {
            return;
          }

          tweetElement.style.visibility = 'hidden';
          tweetElement.style.height = '0';
          tweetElement.style.margin = '0';
          tweetElement.style.padding = '0';

          // Increment blockedCount in localStorage
          incrementBlockedCount();
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
    const sidebarVerifiedOrgs = document.querySelector('[aria-label="Verified Orgs"]');
    const profileGetVerified = document.querySelector('[href="/i/premium_sign_up"]');
    const rightsideSubToPremium = document.querySelector('[aria-label="Subscribe to Premium"]');
    const rightsideLongPosts = document.querySelector('[aria-label="Subscribe to Premium to write your own longer posts"]');

    if (sidebarPremium) {
      sidebarPremium.remove();
    }
    if (sidebarGrok) {
      sidebarGrok.remove();
    }
    if (sidebarVerifiedOrgs) {
      sidebarVerifiedOrgs.remove();
    }
    if (profileGetVerified) {
      profileGetVerified.remove();
    }
    if (rightsideSubToPremium && rightsideSubToPremium.parentNode) {
      rightsideSubToPremium.parentNode.remove();
    }
    if (rightsideLongPosts && rightsideLongPosts.parentNode) {
      rightsideLongPosts.parentNode.remove();
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

// Increment the blocked count in the popup
function incrementBlockedCount() {
  extensionApi.storage.local.get({ blockedCount: 0 }, (result) => {
    const newCount = result.blockedCount + 1;
    extensionApi.storage.local.set({ blockedCount: newCount }, () => {
      if (extensionApi.runtime.lastError) {
        console.error('Error updating blocked count:', extensionApi.runtime.lastError);
      }
    });
  });
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