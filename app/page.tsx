export const runtime = 'edge'
import { URL } from '../constants'


const myString = `
Welcome to\n Yoink Streams by Superfluid\n
The stream follows the last Yoinker\n
Start Yoinking below ↓
`;
const myStringEncoded = encodeURIComponent(myString);
const image = `${URL}/imgen?text=${myStringEncoded}`;
const buttonText1 = '🔻 Start Yoinking'
const buttonText2 = '🏆 Go to Learderboard'

export default function Home() {
  return (
    <div>
      <a href="https://superfluid.finance" target="_blank" rel="no-opener">
      <img
        src={image}
        width={400}
        height={400}
        alt='Hello world.'
      />
      </a>
    </div>
  );
}

export async function generateMetadata() {
  const meta = {
    'og:image': image,
    'fc:frame': 'vNext',
    'fc:frame:image': image,
    'fc:frame:image:aspect_ratio': '1:1',
    'fc:frame:button:1': buttonText1,
    'fc:frame:button:1:action': 'post',
    'fc:frame:button:1:target': `${URL}/check`,
    'fc:frame:post_url': `${URL}/check`,
    'fc:frame:button:2': buttonText2,
    'fc:frame:button:2:action': 'link',
    'fc:frame:button:2:target': `https://app.superfluid.finance/`,

  }

  return {
    openGraph: {
      images: [
        {
          url: image,
          width: '1000',
          height: '1000'
        }
      ]
    },
    other: {
      ...meta
    },
  }
}