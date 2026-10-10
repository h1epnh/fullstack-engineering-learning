import { type SavedPayee, transferService } from '@ewallet-lab/api-client';
import { Button, Card, Icon, Screen, TextField } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

export function SavedPayees({
  selfUserId,
  onSelectPayee,
  onBack,
}: {
  selfUserId: string;
  onSelectPayee: (phone: string) => void;
  onBack: () => void;
}) {
  const [payees, setPayees] = useState<SavedPayee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addPhone, setAddPhone] = useState('');
  const [addNickname, setAddNickname] = useState('');
  const [addFavorite, setAddFavorite] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit nickname state
  const [editingPayee, setEditingPayee] = useState<SavedPayee | null>(null);
  const [editNickname, setEditNickname] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  async function loadPayees() {
    setLoading(true);
    setError(null);
    try {
      const data = await transferService.listPayees(selfUserId);
      setPayees(data);
    } catch (e: any) {
      setError(e.message || 'Không thể tải danh bạ người thụ hưởng');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayees();
  }, [selfUserId]);

  async function handleToggleFavorite(payee: SavedPayee) {
    try {
      const updated = await transferService.updatePayee(selfUserId, payee.id, {
        isFavorite: !payee.isFavorite,
      });
      setPayees((prev) => prev.map((p) => (p.id === payee.id ? updated : p)));
    } catch (e: any) {
      alert(e.message || 'Không thể cập nhật trạng thái yêu thích');
    }
  }

  async function handleDelete(payee: SavedPayee) {
    if (!window.confirm(`Bạn có chắc muốn xoá ${payee.nickname || payee.payeeName} khỏi danh bạ?`)) {
      return;
    }
    try {
      await transferService.deletePayee(selfUserId, payee.id);
      setPayees((prev) => prev.filter((p) => p.id !== payee.id));
    } catch (e: any) {
      alert(e.message || 'Không thể xoá người thụ hưởng');
    }
  }

  async function handleAddPayee() {
    if (!addPhone.trim()) {
      setAddError('Vui lòng nhập số điện thoại');
      return;
    }
    setAddLoading(true);
    setAddError(null);
    try {
      await transferService.savePayee(selfUserId, {
        payeePhone: addPhone.trim(),
        nickname: addNickname.trim() || undefined,
        isFavorite: addFavorite,
      });
      setShowAddModal(false);
      setAddPhone('');
      setAddNickname('');
      setAddFavorite(false);
      await loadPayees();
    } catch (e: any) {
      setAddError(e.message || 'Không thể lưu người thụ hưởng');
    } finally {
      setAddLoading(false);
    }
  }

  async function handleSaveEditNickname() {
    if (!editingPayee) return;
    setEditLoading(true);
    try {
      const updated = await transferService.updatePayee(selfUserId, editingPayee.id, {
        nickname: editNickname.trim() || undefined,
      });
      setPayees((prev) => prev.map((p) => (p.id === editingPayee.id ? updated : p)));
      setEditingPayee(null);
    } catch (e: any) {
      alert(e.message || 'Không thể cập nhật biệt danh');
    } finally {
      setEditLoading(false);
    }
  }

  const filteredPayees = payees.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.payeeName.toLowerCase().includes(q) ||
      (p.nickname && p.nickname.toLowerCase().includes(q)) ||
      p.payeePhone.includes(q)
    );
  });

  return (
    <Screen title="Danh bạ người thụ hưởng" withNavGutter={false}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: 'var(--el-accent-ink)',
            fontSize: 13,
            fontWeight: 600,
            padding: 0,
          }}
        >
          <Icon name="arrow_back" size={18} />
          Quay lại
        </button>
        <Button
          onClick={() => {
            setShowAddModal(true);
            setAddError(null);
          }}
          style={{ fontSize: 12, padding: '6px 12px', width: 'auto' }}
        >
          <Icon name="person_add" size={16} style={{ marginRight: 4 }} />
          Thêm người nhận
        </Button>
      </div>

      <TextField
        id="searchPayees"
        label="Tìm kiếm"
        placeholder="Tìm theo tên, biệt danh hoặc số điện thoại..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {error && (
        <Card style={{ background: '#fff1f0', borderColor: '#ffa39e', marginBottom: 12 }}>
          <p style={{ margin: 0, color: '#cf1322', fontSize: 13 }}>{error}</p>
        </Card>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--el-muted)', padding: '20px 0' }}>Đang tải danh bạ...</p>
      ) : filteredPayees.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '30px 16px' }}>
          <Icon name="contacts" size={40} style={{ color: 'var(--el-faint)', marginBottom: 8 }} />
          <p style={{ fontSize: 13.5, fontWeight: 600, margin: '0 0 4px' }}>Chưa có người thụ hưởng nào</p>
          <p style={{ fontSize: 12, color: 'var(--el-muted)', margin: 0 }}>
            {searchQuery ? 'Không tìm thấy kết quả phù hợp.' : 'Lưu người nhận để chuyển tiền 1-chạm nhanh chóng.'}
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredPayees.map((payee) => {
            const initial = (payee.nickname || payee.payeeName).charAt(0).toUpperCase();
            return (
              <Card key={payee.id} style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flex: 1 }}
                    onClick={() => onSelectPayee(payee.payeePhone)}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'var(--el-card-badge-bg, #f0f5ff)',
                        color: 'var(--el-accent-ink, #1d39c4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      {initial}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>
                          {payee.nickname ? `${payee.nickname} (${payee.payeeName})` : payee.payeeName}
                        </span>
                        {payee.isFavorite && (
                          <span title="Người nhận yêu thích" style={{ color: '#faad14', display: 'flex' }}>
                            <Icon name="star" size={16} />
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--el-muted)' }}>{payee.payeePhone}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      onClick={() => handleToggleFavorite(payee)}
                      title={payee.isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                      style={{
                        background: 'none',
                        border: 0,
                        cursor: 'pointer',
                        color: payee.isFavorite ? '#faad14' : 'var(--el-faint)',
                        padding: 4,
                      }}
                    >
                      <Icon name={payee.isFavorite ? 'star' : 'star_border'} size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingPayee(payee);
                        setEditNickname(payee.nickname || '');
                      }}
                      title="Sửa biệt danh"
                      style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--el-muted)', padding: 4 }}
                    >
                      <Icon name="edit" size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(payee)}
                      title="Xoá người nhận"
                      style={{ background: 'none', border: 0, cursor: 'pointer', color: '#ff4d4f', padding: 4 }}
                    >
                      <Icon name="delete" size={18} />
                    </button>
                    <Button
                      onClick={() => onSelectPayee(payee.payeePhone)}
                      style={{ fontSize: 11.5, padding: '4px 10px', width: 'auto', marginLeft: 4 }}
                    >
                      Chuyển
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal thêm người nhận */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 20,
              width: '100%',
              maxWidth: 400,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>Thêm người nhận vào danh bạ</h3>
            {addError && (
              <p style={{ margin: 0, color: '#cf1322', fontSize: 12.5, background: '#fff1f0', padding: 8, borderRadius: 6 }}>
                {addError}
              </p>
            )}
            <TextField
              id="addPayeePhone"
              label="Số điện thoại người nhận"
              placeholder="09xxxxxxxx"
              value={addPhone}
              onChange={(e) => setAddPhone(e.target.value)}
            />
            <TextField
              id="addPayeeNickname"
              label="Biệt danh (tuỳ chọn)"
              placeholder="Ví dụ: Mẹ, Bạn thân, Chủ nhà..."
              value={addNickname}
              onChange={(e) => setAddNickname(e.target.value)}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={addFavorite}
                onChange={(e) => setAddFavorite(e.target.checked)}
              />
              Đánh dấu là người nhận yêu thích
            </label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Button
                onClick={() => setShowAddModal(false)}
                style={{ background: '#f0f0f0', color: '#333' }}
              >
                Huỷ
              </Button>
              <Button onClick={handleAddPayee} disabled={addLoading}>
                {addLoading ? 'Đang lưu...' : 'Lưu người nhận'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal sửa biệt danh */}
      {editingPayee && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 20,
              width: '100%',
              maxWidth: 380,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>
              Sửa biệt danh ({editingPayee.payeeName})
            </h3>
            <TextField
              id="editNicknameInput"
              label="Biệt danh mới"
              placeholder="Để trống nếu muốn bỏ biệt danh"
              value={editNickname}
              onChange={(e) => setEditNickname(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Button
                onClick={() => setEditingPayee(null)}
                style={{ background: '#f0f0f0', color: '#333' }}
              >
                Huỷ
              </Button>
              <Button onClick={handleSaveEditNickname} disabled={editLoading}>
                {editLoading ? 'Đang lưu...' : 'Cập nhật'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}
