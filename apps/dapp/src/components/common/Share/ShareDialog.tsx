import { useCallback, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Button } from '@dopex-io/ui';
import { toast } from 'react-hot-toast';

import DownloadIcon from '@mui/icons-material/Download';
import TwitterIcon from '@mui/icons-material/Twitter';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { Typography } from 'components/UI';
import Dialog from 'components/UI/Dialog';

import ShareImage, { ShareImageProps } from './ShareImage';

import imageUpload from 'utils/general/imageUpload';
import getTwitterIntentURL from 'utils/general/getTwitterIntentURL';
import getShareURL from 'utils/general/getShareURL';

import { CLOUDINARY_API_KEY } from 'constants/env';

interface ShareDialogProps {
  open: boolean;
  handleClose: (e: any, reason: string) => void;
  shareImageProps: ShareImageProps;
}

const ShareDialog = (props: ShareDialogProps) => {
  const { open, handleClose, shareImageProps } = props;

  const [loading, setLoading] = useState(false);
  const [imageID, setImageID] = useState('');

  const ref = useRef<HTMLDivElement>(null);

  const uploadImage = useCallback(async () => {
    if (ref.current === null) {
      return;
    }

    const image = await toPng(ref.current, { cacheBust: true });

    if (CLOUDINARY_API_KEY) {
      setLoading(true);
      const response = await imageUpload({
        file: image,
        upload_preset: 'rjhw5klp',
        api_key: CLOUDINARY_API_KEY,
      });
      const _imageID = response.public_id.split('share_images/')[1];
      setImageID(_imageID);
      setLoading(false);
      return _imageID;
    }
  }, []);

  const onTweet = useCallback(async () => {
    let _imageID = imageID;
    if (!_imageID) {
      _imageID = await uploadImage();
    }
    window.open(
      getTwitterIntentURL(
        'Latest trade on @dopex_io ',
        getShareURL(_imageID, shareImageProps.customPath || '/')
      ),
      '_blank'
    );
  }, [imageID, uploadImage, shareImageProps.customPath]);

  const onDownload = useCallback(() => {
    if (ref.current === null) {
      return;
    }

    toPng(ref.current, { cacheBust: true })
      .then((dataUrl: string) => {
        const link = document.createElement('a');
        link.download = 'dopex-share.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err: Error) => {
        console.log(err);
      });
  }, [ref]);

  const onCopy = useCallback(async () => {
    let _imageID = imageID;

    if (!_imageID) {
      _imageID = await uploadImage();
    }
    navigator.clipboard.writeText(
      getShareURL(_imageID, shareImageProps.customPath || '/')
    );
    toast.success('Copied!!! ');
  }, [imageID, uploadImage, shareImageProps.customPath]);

  return (
    <Dialog
      className="w-full"
      open={open}
      width={600}
      showCloseIcon
      handleClose={handleClose}
    >
      <div className="p-2">
        <Typography variant="h5" className="text-white font-semibold mb-4">
          Share
        </Typography>
        <>
          <div className="border-2 border-carbon">
            <ShareImage ref={ref} {...shareImageProps} />
          </div>
          {loading ? (
            <div className="text-white">Uploading image...</div>
          ) : null}
          <div className="flex space-x-4 mt-4">
            <Button color="carbon" onClick={onDownload}>
              <DownloadIcon /> Download
            </Button>
            <Button color="carbon" onClick={onCopy}>
              <ContentCopyIcon /> Copy Link
            </Button>
            <Button color="carbon" onClick={onTweet}>
              <TwitterIcon /> Tweet
            </Button>
          </div>
        </>
      </div>
    </Dialog>
  );
};

export default ShareDialog;
