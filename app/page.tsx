import RecordingSection from '@/components/RecordingSection'

export default async function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-12'>
      <h1 className='text-2xl text-center text-indigo-800 sm:text-3xl mb-6 font-bold'>
        Standup Comedy Practice with AI
      </h1>
      <RecordingSection />
    </main>
  )
}
