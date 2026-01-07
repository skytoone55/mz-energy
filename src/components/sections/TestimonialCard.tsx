import Image from 'next/image'

interface TestimonialCardProps {
  quote: string
  author: string
  details?: string
  image?: string
}

export function TestimonialCard({ quote, author, details, image }: TestimonialCardProps) {
  return (
    <div className="bg-card rounded-xl p-8 border">
      {image && (
        <div className="mb-6">
          <div className="w-24 h-24 rounded-full mx-auto overflow-hidden bg-secondary">
            <Image
              src={image}
              alt={author}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
      <blockquote className="text-lg italic text-muted-foreground mb-6">
        &quot;{quote}&quot;
      </blockquote>
      <div className="border-t pt-4">
        <p className="font-semibold">{author}</p>
        {details && (
          <p className="text-sm text-muted-foreground mt-1">{details}</p>
        )}
      </div>
    </div>
  )
}

