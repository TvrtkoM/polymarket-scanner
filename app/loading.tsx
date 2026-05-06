import { Spinner } from '@/components/ui/spinner'

export default function Loading() {
  return (
    <div className="mt-12 justify-center flex w-full">
      <Spinner size={46} />
    </div>
  )
}
