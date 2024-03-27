'use client'

import {
  CreateProjectKeyResponse,
  LiveClient,
  LiveTranscriptionEvents,
  createClient,
} from '@deepgram/sdk'
import { useState, useEffect, useCallback } from 'react'
import { useQueue } from '@uidotdev/usehooks'
import { MicrophoneIcon } from '@heroicons/react/24/solid'
import { classNames } from '@/utils/helpers'

export default function RecordingSection() {
  const { add, remove, first, size, queue } = useQueue<any>([])
  const [apiKey, setApiKey] = useState<CreateProjectKeyResponse | null>()
  const [connection, setConnection] = useState<LiveClient | null>()
  const [isListening, setListening] = useState(false)
  const [isLoadingKey, setLoadingKey] = useState(true)
  const [isLoading, setLoading] = useState(true)
  const [isProcessing, setProcessing] = useState(false)
  const [micOpen, setMicOpen] = useState(false)
  const [microphone, setMicrophone] = useState<MediaRecorder | null>()
  const [userMedia, setUserMedia] = useState<MediaStream | null>()
  const [caption, setCaption] = useState<string | null>()
  const [fullTranscript, setFullTranscript] = useState<string>('')
  const [judgmentHistory, setJudgmentHistory] = useState<string[]>([])
  const [audios, setAudios] = useState<{ [key: string]: HTMLAudioElement }>({})
  const [lastPlayedCategory, setLastPlayedCategory] = useState<string | null>(
    null
  )
  const [baseCrowdSound, setBaseCrowdSound] = useState<HTMLAudioElement | null>(
    null
  )
  const [lastPlayTime, setLastPlayTime] = useState<number>(0)

  // Adjusted debounce function for immediate play in case of "neutral" category
  const playAudio = (category: string) => {
    console.log('Playing audio for category:', category)
    if (audios[category]) {
      const categoryVolumes: any = {
        Funny: 0.5,
        Neutral: 0.2,
        Controversial: 0.6,
        Applause: 0.8,
        Sad: 0.4,
      }
      // Set the volume based on the category
      audios[category].volume = categoryVolumes[category] || 0.2

      audios[category]
        .play()
        .then(() => {
          setLastPlayTime(Date.now())
        })
        .catch((error) => console.error('Failed to play audio', error))

      // Stop the audio after 6 seconds if it's still playing
      setTimeout(() => {
        audios[category].pause()
        // Reset the audio to the start for next time it's played
        audios[category].currentTime = 0
      }, 4000)

      setLastPlayedCategory(category) // Update the last played category
    }
  }

  const playAudioDebounced = debounce(playAudio, 0)

  // Function to decide whether to play immediately or debounce
  const decidePlayAudio = (category: string) => {
    const currentTime = Date.now()
    const timeElapsedSinceLastPlay = (currentTime - lastPlayTime) / 1000 // Time in seconds

    console.log('lastPlayedCategory:', lastPlayedCategory)

    if (category === 'neutral') {
      console.log('Playing audio immediately for neutral category:', category)
      playAudio(category)
    } else if (
      timeElapsedSinceLastPlay > 2 ||
      category !== lastPlayedCategory
    ) {
      // Play immediately if more than 2 seconds have passed or the category has changed
      console.log('Playing audio for category:', category)
      playAudio(category)
    } else {
      console.log('Playing audio debounced for category:', category)
      playAudioDebounced(category) // Use debounced version otherwise
    }
  }

  const toggleMicrophone = useCallback(async () => {
    if (microphone && userMedia) {
      setUserMedia(null)
      setMicrophone(null)

      microphone.stop()
      baseCrowdSound?.pause()
    } else {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })

      const microphone = new MediaRecorder(userMedia)
      microphone.start(500)

      microphone.onstart = () => {
        setMicOpen(true)
        baseCrowdSound
          ?.play()
          .catch((error) =>
            console.error('Failed to play base crowd sound', error)
          ) // Play the base crowd sound when recording starts
      }

      microphone.onstop = () => {
        setMicOpen(false)
        baseCrowdSound?.pause()
      }

      microphone.ondataavailable = (e) => {
        add(e.data)
      }

      setUserMedia(userMedia)
      setMicrophone(microphone)
    }
  }, [add, microphone, userMedia])

  const debouncedJudgeCall = useCallback(
    debounce(async (fullTranscript: string) => {
      // Extract the larger context and the focal section
      const words = fullTranscript.split(' ')
      const recentContext = words.slice(-20).join(' ') // Last 100 words for broader context
      const focusSection = words.slice(-5).join(' ') // Last 20 words as the focal point
      console.log('Calling API to judge the recentContext: ', recentContext)
      console.log('Calling API to judge the focusSection: ', focusSection)

      const promptToSend = `Based on the latest slice and the overall context, categorize this section of the transcript: "${focusSection}" within the broader context: "${recentContext}"`

      const response = await fetch('/api/judge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptToSend }),
      })
      const data = await response.json()
      try {
        const formattedData = JSON.parse(data.judgement)
        console.log('New Judgment:', formattedData)
        setJudgmentHistory((prevHistory) => [
          ...prevHistory,
          formattedData.category,
        ])
      } catch {
        console.error('Error parsing judgment response')
      }
    }, 300),
    []
  )

  // Load audio files
  useEffect(() => {
    // Load the base crowd sound
    const crowdAudio = new Audio('reactions/crowd.wav')
    crowdAudio.loop = true // Enable looping
    crowdAudio.volume = 0.05 // Set a comfortable background volume
    setBaseCrowdSound(crowdAudio)

    const audioFiles = {
      Funny: new Audio('/reactions/funny.wav'),
      Neutral: new Audio('/reactions/neutral.mp3'),
      Controversial: new Audio('/reactions/controversial.wav'),
      Sad: new Audio('/reactions/sad.wav'),
      Applause: new Audio('/reactions/applause.wav'),
    }
    setAudios(audioFiles)
  }, [])

  useEffect(() => {
    if (judgmentHistory.length > 0) {
      console.log('judgmentHistory:', judgmentHistory)
      const lastJudgment = judgmentHistory[judgmentHistory.length - 1]
      decidePlayAudio(lastJudgment) // Use the decision function
    }
  }, [judgmentHistory])

  useEffect(() => {
    if (!apiKey) {
      console.log('getting a new api key')
      fetch('/api/deepgram-key', { cache: 'no-store' })
        .then((res) => res.json())
        .then((object) => {
          if (!('key' in object)) throw new Error('No api key returned')

          setApiKey(object)
          setLoadingKey(false)
        })
        .catch((e) => {
          console.error(e)
        })
    }
  }, [apiKey])

  useEffect(() => {
    if (apiKey && 'key' in apiKey) {
      console.log('connecting to deepgram')
      const deepgram = createClient(apiKey?.key ?? '')
      const connection = deepgram.listen.live({
        model: 'nova',
        interim_results: false,
        smart_format: true,
      })

      connection.on(LiveTranscriptionEvents.Open, () => {
        console.log('connection established')
        setListening(true)
      })

      connection.on(LiveTranscriptionEvents.Close, () => {
        console.log('connection closed')
        setListening(false)
        setApiKey(null)
        setConnection(null)
      })

      connection.on(LiveTranscriptionEvents.Transcript, async (data) => {
        const words = data.channel.alternatives[0].words
        const newCaption = words
          .map((word: any) => word.punctuated_word ?? word.word)
          .join(' ')

        console.log('We are getting a caption:', newCaption)
        setCaption(newCaption)
        setFullTranscript((prevTranscript) => {
          if (
            newCaption.trim() &&
            !prevTranscript.includes(newCaption.trim())
          ) {
            const updatedTranscript = `${prevTranscript} ${newCaption}`.trim()
            console.log(
              'Updating full transcript with new caption:',
              updatedTranscript
            )
            debouncedJudgeCall(updatedTranscript)
            return updatedTranscript
          } else {
            console.log(
              'Caption is considered duplicate or empty, not updating.'
            )
            return prevTranscript
          }
        })
      })

      setConnection(connection)
      setLoading(false)
    }
  }, [apiKey])

  useEffect(() => {
    const processQueue = async () => {
      if (size > 0 && !isProcessing) {
        setProcessing(true)

        if (isListening) {
          const blob = first
          connection?.send(blob)
          remove()
        }

        const waiting = setTimeout(() => {
          clearTimeout(waiting)
          setProcessing(false)
        }, 250)
      }
    }

    processQueue()
  }, [connection, queue, remove, first, size, isProcessing, isListening])

  function debounce(
    func: (...args: any[]) => void,
    wait: number
  ): (...args: any[]) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null

    return function executedFunction(...args: any[]): void {
      const later = () => {
        timeout = null
        func(...args)
      }

      if (timeout !== null) {
        clearTimeout(timeout)
      }

      timeout = setTimeout(later, wait)
    }
  }

  if (isLoadingKey)
    return (
      <span className='w-full text-center'>Loading temporary API key...</span>
    )
  if (isLoading)
    return <span className='w-full text-center'>Loading the app...</span>

  return (
    <div className='min-h-screen w-full relative'>
      <div className='mt-10 flex flex-col align-middle items-center'>
        <button className='w-24 h-24' onClick={() => toggleMicrophone()}>
          <MicrophoneIcon
            className={
              `cursor-pointer h-12 w-12` + !!userMedia &&
              !!microphone &&
              micOpen
                ? 'fill-indigo-500'
                : 'fill-gray-600'
            }
          />
        </button>
        <div className='mt-20 p-6 text-xl text-center'>
          {caption && micOpen ? caption : '...'}
        </div>
        <p className='mt-12'>
          Crowd Reaction:{' '}
          <span
            className={classNames(
              'text-lg font-medium',
              judgmentHistory[judgmentHistory.length - 1] === 'Neutral'
                ? 'text-gray-700'
                : judgmentHistory[judgmentHistory.length - 1] ===
                    'Very Funny' ||
                  judgmentHistory[judgmentHistory.length - 1] ===
                    'Controversial'
                ? 'text-red-500'
                : 'text-indigo-500'
            )}
          >
            {judgmentHistory[judgmentHistory.length - 1]}
          </span>
        </p>
      </div>
      <div
        className='z-20 text-white flex shrink-0 grow-0 justify-around items-center 
                  fixed bottom-0 right-5 rounded-lg mr-1 mb-5 lg:mr-5 lg:mb-5 xl:mr-10 xl:mb-10 gap-5'
      >
        <span className='text-sm text-gray-400'>
          {isListening ? 'connection open!' : 'is connecting...'}
        </span>
      </div>
    </div>
  )
}
