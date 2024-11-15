import { fetchVideosInPost } from "./bsky";
import { convertTsToMp4 } from "./video";

const funzors: string[] = [
    "Firing up the hamster wheel...",
    "Engaging hyper-download mode...",
    "Counting bytes like they're sheep...",
    "Unleashing the internet elves...",
    "Downloading...probably.",
    "Adding a sprinkle of speed...",
    "Polishing the bits...",
    "Herding the data cows...",
    "Teaching the packets to behave...",
    "Convincing the server to cooperate...",
    "Doing the download dance...",
    "Just a sec...or two...",
    "Downloading...do you feel the excitement?",
    "Feeding the digital ducks...",
    "Loading...eventually...",
    "Summoning download fairies...",
    "Progress is...a mystery.",
    "Downloading in stealth mode...",
    "Patience is a virtue, they say...",
    "Buffering the good vibes...",
    "Counting invisible pixels...",
    "Borrowing bandwidth from a neighbor...",
    "Cracking open a cold download...",
    "Progress? Never heard of it.",
    "Loading like it's 1999...",
    "Training bits to run faster...",
    "Sending good vibes to the server...",
    "Chasing the download gremlins away...",
    "Brewin’ up some data magic...",
    "Squeezing the download toothpaste...",
    "Convincing electrons to move faster...",
    "Waiting...but make it fun...",
    "Fueling up on virtual coffee...",
    "Bribing the download gods...",
    "Turning up the download mojo...",
    "Hitting the turbo download button...",
    "Rounding up the loose bytes...",
    "Downloading with style and grace...",
    "Hacking the speed matrix...",
    "Dancing with digital destiny...",
    "Shooting for download glory...",
    "Surfing the byte waves...",
    "Conjuring the data spirits...",
    "On a mission to download greatness...",
    "Unzipping the mysteries of the internet...",
    "Counting down to download bliss...",
    "Loading...but in a quirky way...",
    "Summoning the download wizard...",
    "Plotting the course to 100%...",
    "Optimizing your download experience...",
    "Chasing the progress bar dream...",
    "Harnessing the power of lag...",
    "Channeling my inner progress bar...",
    "Working...sort of...",
    "Slow and steady wins the download...",
    "Progress bars are overrated, anyway...",
    "Lassoing the final bytes...",
    "Duct-taping the download together...",
    "Tickling the download dragons...",
    "Channeling Wi-Fi sorcery...",
    "Boosting download with cat memes...",
    "Pausing to admire your patience...",
    "Faking progress to keep you entertained...",
    "Coding a faster download in real time...",
    "Knocking on the server's door...",
    "Warming up the download pipes...",
    "Unleashing the byte ninjas...",
    "Sharpening the internet machete...",
    "Tuning in to download FM...",
    "Gathering download mana...",
    "Guesstimating the progress bar...",
    "Fixing a digital flat tire...",
    "Sprinkling in some download dust...",
    "Lighting the download bonfire...",
    "Pushing electrons uphill...",
    "Spinning up the download centrifuge...",
    "Navigating the data jungle...",
    "Scraping the barrel of bytes...",
    "Hunting down the rogue packets...",
    "Serving fresh data with a smile...",
    "Bridging the digital divide...",
    "Fiddling with the Wi-Fi knobs...",
    "Cooking up some download soup...",
    "Sharpening the download pixels...",
    "Riding the byte pony to freedom...",
    "Knitting the download scarf...",
    "Assembling the download IKEA kit...",
    "Hyping up the download party...",
    "Weaving the download tapestry...",
    "Upgrading your patience module...",
    "Unlocking the secrets of 99%...",
    "Refueling the download rocket...",
    "Counting bytes like it's tax season...",
    "Testing your Zen with slow downloads...",
    "Setting up the byte dominoes...",
    "Charging up the download capacitor..."
];

function setupUi() {
	const inputField = document.getElementById("postUrl") as HTMLInputElement;
	const downloadButton = document.getElementById("download") as HTMLButtonElement;
    const progressText = document.getElementById("progressText") as HTMLDivElement;
    const thumbImg = document.getElementById("thumb") as HTMLImageElement;

	inputField.addEventListener("input", () => {
		downloadButton.disabled = !inputField.value.startsWith("https://");
	});

	downloadButton.addEventListener("click", async () => {
        funzors.sort(() => Math.random() - 0.5);
        let funzorsIdx = 0;

        const progressCallback = (progress: number, thumbUrl: string | null) => {
            if (thumbUrl) {
                thumbImg.src = thumbUrl;
                thumbImg.style.display = "";
            }
            progressText.innerText = funzors[funzorsIdx++] + " " + progress + "%";
            if (funzorsIdx >= funzors.length) funzorsIdx = 0;
        }
		downloadButton.disabled = true;
        thumbImg.style.display = "none";
        thumbImg.src = "";
        progressText.style.display = "";
        progressCallback(0, null);
		const result = await fetchVideosInPost(inputField.value, progressCallback);
		if (result != null) {
            if (!result.isGIF) {
                result.blob = await convertTsToMp4(result.blob, (progress: number) => {
                    progress = (progress * 95 + 5) | 0;
                    progressCallback(progress, null);
                });
            }
			const link = document.createElement("a");
			link.href = URL.createObjectURL(result.blob);
			link.download = result.isGIF ? "video.gif" : "video.mp4";
			link.click();
			URL.revokeObjectURL(link.href);
            progressText.innerText = "Check your downloads folder";
		} else {
            progressText.innerText = "Sorry, something terrible happened and everything exploded.";
        }
        thumbImg.src = "";
        thumbImg.style.display = "none";
		downloadButton.disabled = false;
	});
}

setupUi();
