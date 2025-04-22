import { ChatSidebar } from '@/components';
import { redirect } from 'next/navigation';
import { getLatestConversationIdAction } from '@/app/actions/converstations';

export default async function MessagesPage() {
   // Fetch the latest conversation ID directly from the server
   // const { latestConversationId, error } = await getLatestConversationIdAction();
   
   // // If we have a latest conversation, redirect to it
   // if (latestConversationId) {
   //    redirect(`/messages/${latestConversationId}`);
   // }
   
   // If no conversation exists or there was an error, show the empty messages page
   return (
      <>
         <ChatSidebar 
          
         />
      </>
   );
}
