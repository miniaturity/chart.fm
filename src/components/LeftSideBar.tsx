import { ChangeEvent } from "react"
import { period, TopAlbumsResponse } from "../api/lastfm"

interface LeftSideBarProps {
  canvas: {
    size: {
      width: number,
      height: number
    },
    setCanvasSize: React.Dispatch<React.SetStateAction<{width: number; height: number; }>>
  }

  userInfo: {
    isNew: boolean,
    name?: string,
    period?: period,
    lastReq?: number,
    albums?: TopAlbumsResponse | null
  }

  handleImage: {
    handleUpload: (e: ChangeEvent<HTMLInputElement>) => void,
    exportAsImage: () => void
  }
}

export const LeftSideBar: React.FC<LeftSideBarProps> = ({
  canvas, userInfo, handleImage
}) => {

  return (
    <>
      {userInfo.isNew ? 
        <NewCanvasMode />
        :
        <EditMode />
      }
    </>
  )
}

const EditMode: React.FC = () => {


  
  return (
    <>

    </>
  )
}

const NewCanvasMode: React.FC = () => {

  return (
    <>
    
    </>
  )
}