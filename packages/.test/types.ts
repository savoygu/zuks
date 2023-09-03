export interface Comment {
  id: number
  name: string
  email: string
  body: string
  postId: number
}

export interface LabelValue {
  label: string
  value: number
}

export interface LabelValuePost extends LabelValue {
  postId: number
}

export type IdNamePost = Pick<Comment, 'id' | 'name' | 'postId'>

