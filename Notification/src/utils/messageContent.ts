export const EMAIL_CONTENT = {
    Video_Processing_Complete: {
        subject: 'Your video is ready to watch',
        body: `Hi,

Great news! Your video has finished processing and is now ready to watch.

{{action_url}}

Thanks for using our platform!`,
    },

    Video_Processing_Failed: {
        subject: 'Video processing failed',
        body: `Hi,

Unfortunately, we were unable to process your video.

Please try uploading again or contact support.`,
    },

    Video_Audio_Transcription_Complete: {
        subject: 'Audio transcription is ready',
        body: `Hi,

Your video’s audio transcription is complete.

{{action_url}}`,
    },

    Video_Audio_Transcription_Failed: {
        subject: ' Audio transcription failed',
        body: `Hi,

We couldn’t generate a transcription for your video's audio.

Please try again.`,
    },
} as const;


const SMS_CONTENT = {
    Video_Processing_Complete: `Your video is ready! Watch it here: {{action_url}}`,
    Video_Processing_Failed: `Video processing failed. Please try again.`,
    Video_Audio_Transcription_Complete: `Audio transcription is complete! View it here: {{action_url}}`,
    Video_Audio_Transcription_Failed: `Audio transcription failed. Please try again.`,
} as const;