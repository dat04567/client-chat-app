import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Custom hook để quản lý việc mời người dùng vào cuộc trò chuyện
 */
export const useInviteUsers = (conversationId: string, inviteToConversation: any) => {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [isInvitingMultiple, setIsInvitingMultiple] = useState(false);
  
  // Xử lý mời một người dùng
  const handleInviteUser = useCallback((userId: string) => {
    setIsInviting(true);
    
    // Gọi API để mời người dùng
    inviteToConversation({
      conversationId,
      invitedUserId: userId
    })
    .unwrap()
    .then(() => {
      // Khi thành công, thêm người dùng vào danh sách đã chọn
      setSelectedUserIds((prev) => [...prev, userId]);
      toast.success('Đã mời thành công vào nhóm chat');
    })
    .catch((error: any) => {
      toast.error(error?.data?.message || 'Không thể mời người dùng này');
    })
    .finally(() => {
      setIsInviting(false);
    });
  }, [conversationId, inviteToConversation]);
  
  // Xử lý mời nhiều người dùng
  const handleInviteSelectedUsers = useCallback(() => {
    if (selectedUserIds.length === 0) return;
    
    setIsInvitingMultiple(true);
    
    // Sử dụng Promise.all để gửi tất cả lời mời song song
    const invitePromises = selectedUserIds.map(userId => 
      inviteToConversation({
        conversationId,
        invitedUserId: userId
      }).unwrap()
    );
    
    Promise.all(invitePromises)
      .then(() => {
        toast.success('Đã mời tất cả thành viên đã chọn vào nhóm chat');
        setSelectedUserIds([]);
      })
      .catch((error: any) => {
        toast.error('Có lỗi xảy ra khi mời một số thành viên');
      })
      .finally(() => {
        setIsInvitingMultiple(false);
      });
  }, [conversationId, selectedUserIds, inviteToConversation]);
  
  return {
    selectedUserIds,
    setSelectedUserIds,
    isInviting,
    isInvitingMultiple,
    handleInviteUser,
    handleInviteSelectedUsers
  };
};
