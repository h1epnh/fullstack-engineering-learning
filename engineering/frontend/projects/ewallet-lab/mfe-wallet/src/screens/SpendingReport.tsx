import {
  type CategoryBreakdownItem,
  type MonthlyBudget,
  type SpendingCategory,
  type SpendingPeriod,
  type SpendingReport as SpendingReportData,
  type SpendingTransactionItem,
  walletService,
} from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { Button, Card, EmptyState, Icon, ProgressBar, Screen, TextField, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

type Tab = 'report' | 'budgets' | 'cash';

export default function SpendingReport({ session, onBack }: { session: Session; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('report');
  const [period, setPeriod] = useState<SpendingPeriod>('month');
  const [report, setReport] = useState<SpendingReportData | null>(null);
  const [loading, setLoading] = useState(true);

  // Danh mục chi tiêu
  const [categories, setCategories] = useState<SpendingCategory[]>([]);
  const [selectedTx, setSelectedTx] = useState<SpendingTransactionItem | null>(null);

  // Ngân sách tháng
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetLimitInput, setBudgetLimitInput] = useState('');
  const [budgetCategoryInput, setBudgetCategoryInput] = useState('ALL');
  const [budgetSuccess, setBudgetSuccess] = useState<string | null>(null);

  // Ghi chi tiêu ngoài ví (tiền mặt)
  const [cashAmount, setCashAmount] = useState('');
  const [cashCategory, setCashCategory] = useState('FOOD_DRINK');
  const [cashNote, setCashNote] = useState('');
  const [cashLoading, setCashLoading] = useState(false);
  const [cashSuccess, setCashSuccess] = useState<string | null>(null);

  // Tạo danh mục mới
  const [showCreateCat, setShowCreateCat] = useState(false);
  const [newCatCode, setNewCatCode] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('sell');

  function loadReport() {
    setLoading(true);
    walletService.getSpendingReport(session.id, period).then((data) => {
      setReport(data);
      setLoading(false);
    });
  }

  function loadCategories() {
    walletService.getSpendingCategories(session.id).then(setCategories).catch(() => {});
  }

  function loadBudgets() {
    setBudgetLoading(true);
    const currentMonth = new Date().toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
    walletService.getBudgets(session.id, currentMonth)
      .then(setBudgets)
      .finally(() => setBudgetLoading(false));
  }

  useEffect(() => {
    loadReport();
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id, period]);

  useEffect(() => {
    if (tab === 'budgets') {
      loadBudgets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Đổi danh mục của giao dịch
  async function handleRecategorize(txId: string, catCode: string) {
    try {
      await walletService.setTransactionCategory(session.id, txId, catCode);
      setSelectedTx(null);
      loadReport();
    } catch (e) {
      console.error('Lỗi khi đổi danh mục:', e);
    }
  }

  // Lưu ngân sách
  async function handleSaveBudget() {
    const limit = Number(cashNoteClean(budgetLimitInput));
    if (isNaN(limit) || limit < 1000) return;

    setBudgetLoading(true);
    setBudgetSuccess(null);
    const currentMonth = new Date().toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
    try {
      await walletService.setBudget(session.id, {
        month: currentMonth,
        categoryCode: budgetCategoryInput,
        budgetLimit: limit,
      });
      setBudgetSuccess('Đã cập nhật ngân sách thành công!');
      setBudgetLimitInput('');
      loadBudgets();
    } catch (e) {
      console.error('Lỗi khi lưu ngân sách:', e);
    } finally {
      setBudgetLoading(false);
    }
  }

  // Thêm chi tiêu tiền mặt ngoài ví
  async function handleAddCashExpense() {
    const amount = Number(cashNoteClean(cashAmount));
    if (isNaN(amount) || amount < 1000) return;

    setCashLoading(true);
    setCashSuccess(null);
    try {
      await walletService.createExternalExpense(session.id, {
        amount,
        categoryCode: cashCategory,
        note: cashNote.trim(),
        spentAt: new Date().toISOString(),
      });
      setCashSuccess('Đã ghi chép khoản chi tiền mặt thành công!');
      setCashAmount('');
      setCashNote('');
      loadReport();
    } catch (e) {
      console.error('Lỗi khi thêm chi tiêu ngoài ví:', e);
    } finally {
      setCashLoading(false);
    }
  }

  // Xoá chi tiêu ngoài ví
  async function handleDeleteCashExpense(expenseId: string) {
    try {
      await walletService.deleteExternalExpense(session.id, expenseId);
      loadReport();
    } catch (e) {
      console.error('Lỗi khi xoá chi tiêu ngoài ví:', e);
    }
  }

  // Tạo danh mục tùy chỉnh mới
  async function handleCreateCategory() {
    if (!newCatCode.trim() || !newCatName.trim()) return;
    try {
      await walletService.createSpendingCategory(session.id, {
        code: newCatCode.trim().toUpperCase(),
        name: newCatName.trim(),
        icon: newCatIcon,
        color: '#8b5cf6',
      });
      setShowCreateCat(false);
      setNewCatCode('');
      setNewCatName('');
      loadCategories();
    } catch (e) {
      console.error('Lỗi khi tạo danh mục:', e);
    }
  }

  function cashNoteClean(val: string) {
    return val.replace(/\D/g, '');
  }

  const grandTotal = report?.total ?? 0;
  const inWalletTotal = report?.inWalletTotal ?? 0;
  const externalTotal = report?.externalTotal ?? 0;

  return (
    <Screen title="Quản lý chi tiêu 2.0" withNavGutter={false}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 14, cursor: 'pointer' }}
      >
        ← Quay lại
      </button>

      {/* 3 Tab Navigation */}
      <div
        style={{
          display: 'flex',
          background: 'var(--el-surface-2)',
          borderRadius: 10,
          padding: 3,
          marginBottom: 16,
        }}
      >
        <button
          onClick={() => setTab('report')}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: 8,
            border: 0,
            background: tab === 'report' ? 'var(--el-surface)' : 'none',
            color: tab === 'report' ? 'var(--el-ink)' : 'var(--el-muted)',
            fontWeight: tab === 'report' ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: tab === 'report' ? 'var(--el-shadow)' : 'none',
          }}
        >
          Báo cáo & Danh mục
        </button>
        <button
          onClick={() => setTab('budgets')}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: 8,
            border: 0,
            background: tab === 'budgets' ? 'var(--el-surface)' : 'none',
            color: tab === 'budgets' ? 'var(--el-ink)' : 'var(--el-muted)',
            fontWeight: tab === 'budgets' ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: tab === 'budgets' ? 'var(--el-shadow)' : 'none',
          }}
        >
          Ngân sách tháng
        </button>
        <button
          onClick={() => setTab('cash')}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: 8,
            border: 0,
            background: tab === 'cash' ? 'var(--el-surface)' : 'none',
            color: tab === 'cash' ? 'var(--el-ink)' : 'var(--el-muted)',
            fontWeight: tab === 'cash' ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: tab === 'cash' ? 'var(--el-shadow)' : 'none',
          }}
        >
          + Ghi tiền mặt
        </button>
      </div>

      {/* TAB 1: BÁO CÁO & DANH MỤC */}
      {tab === 'report' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {(['week', 'month'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 10,
                  border: '1px solid var(--el-line)',
                  background: period === p ? 'var(--el-accent)' : 'var(--el-surface)',
                  color: period === p ? '#fff' : 'var(--el-ink)',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {p === 'week' ? 'Tuần này' : 'Tháng này'}
              </button>
            ))}
          </div>

          {loading ? (
            <ProgressBar label="Đang phân tích dữ liệu chi tiêu…" />
          ) : (
            <>
              {/* Thẻ tổng tiền chi tiêu */}
              <Card>
                <div style={{ fontSize: 11.5, color: 'var(--el-muted)', marginBottom: 2 }}>
                  TỔNG CHI TIÊU ({period === 'week' ? 'TUẦN NÀY' : 'THÁNG NÀY'})
                </div>
                <div
                  style={{
                    fontFamily: 'var(--el-font-display)',
                    fontSize: 26,
                    fontWeight: 800,
                    color: 'var(--el-ink)',
                    marginBottom: 8,
                  }}
                >
                  {formatVnd(grandTotal)}
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--el-muted)', borderTop: '1px solid var(--el-line)', paddingTop: 8 }}>
                  <span>Ví điện tử: <strong style={{ color: 'var(--el-ink)' }}>{formatVnd(inWalletTotal)}</strong></span>
                  <span>•</span>
                  <span>Tiền mặt ngoài ví: <strong style={{ color: 'var(--el-ink)' }}>{formatVnd(externalTotal)}</strong></span>
                </div>
              </Card>

              {/* Biểu đồ phân bổ theo danh mục */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '18px 0 8px' }}>
                <h2 style={{ fontFamily: 'var(--el-font-display)', fontSize: 14.5, fontWeight: 700, margin: 0 }}>
                  Phân bổ theo danh mục
                </h2>
                <button
                  onClick={() => setShowCreateCat(true)}
                  style={{ background: 'none', border: 0, color: 'var(--el-accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  + Danh mục mới
                </button>
              </div>

              {/* Form tạo danh mục mới nếu mở */}
              {showCreateCat && (
                <div style={{ background: 'var(--el-surface)', border: '1px solid var(--el-line)', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Tạo danh mục chi tiêu riêng</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      placeholder="Mã (VD: PETS)"
                      value={newCatCode}
                      onChange={(e) => setNewCatCode(e.target.value)}
                      style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--el-line)', fontSize: 12 }}
                    />
                    <input
                      placeholder="Tên (VD: Thú cưng)"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      style={{ flex: 1.5, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--el-line)', fontSize: 12 }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button variant="ghost" onClick={() => setShowCreateCat(false)} style={{ fontSize: 11, padding: '4px 8px' }}>
                      Huỷ
                    </Button>
                    <Button variant="primary" onClick={handleCreateCategory} style={{ fontSize: 11, padding: '4px 10px' }}>
                      Lưu
                    </Button>
                  </div>
                </div>
              )}

              <Card>
                {(!report?.categoryBreakdown || report.categoryBreakdown.length === 0) ? (
                  <EmptyState icon="donut_large" text="Chưa có chi tiêu nào trong kỳ này." />
                ) : (
                  report.categoryBreakdown.map((item: CategoryBreakdownItem, i: number) => (
                    <div key={item.categoryCode} style={{ marginBottom: i < report.categoryBreakdown!.length - 1 ? 14 : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: `${item.color}22`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon name={item.icon} size={16} style={{ color: item.color }} />
                        </span>
                        <div style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>
                          {item.categoryName} <span style={{ fontSize: 11, color: 'var(--el-muted)' }}>({item.transactionCount})</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                          {formatVnd(item.amount)}
                        </div>
                        <span style={{ fontSize: 11.5, color: 'var(--el-muted)', width: 38, textAlign: 'right' }}>
                          {item.percentage}%
                        </span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: 'var(--el-line)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, item.percentage)}%`, background: item.color }} />
                      </div>
                    </div>
                  ))
                )}
              </Card>

              {/* Danh sách giao dịch chi tiêu trong kỳ */}
              <h2 style={{ fontFamily: 'var(--el-font-display)', fontSize: 14.5, fontWeight: 700, margin: '20px 0 8px' }}>
                Lịch sử chi tiêu ({report?.transactions?.length ?? 0})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {report?.transactions?.map((tx: SpendingTransactionItem) => (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    style={{
                      background: 'var(--el-surface)',
                      border: '1px solid var(--el-line)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          background: `${tx.color}22`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon name={tx.icon} size={18} style={{ color: tx.color }} />
                      </span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{tx.note || tx.categoryName}</div>
                        <div style={{ fontSize: 11, color: 'var(--el-muted)', marginTop: 2 }}>
                          <span
                            style={{
                              background: tx.source === 'CASH' ? '#feebc8' : '#e2e8f0',
                              color: tx.source === 'CASH' ? '#9a3412' : '#334155',
                              padding: '1px 6px',
                              borderRadius: 4,
                              fontWeight: 600,
                              marginRight: 6,
                            }}
                          >
                            {tx.source === 'CASH' ? 'Tiền mặt' : 'Trong Ví'}
                          </span>
                          {tx.categoryName} • Chạm để đổi danh mục
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--el-ink)' }}>
                        -{formatVnd(tx.amount)}
                      </div>
                      {tx.source === 'CASH' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCashExpense(tx.id);
                          }}
                          style={{ background: 'none', border: 0, color: 'var(--el-danger)', fontSize: 11, cursor: 'pointer', padding: 0 }}
                        >
                          Xoá
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Modal / Popup chọn danh mục mới cho giao dịch */}
          {selectedTx && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 999,
                padding: 16,
              }}
            >
              <div
                style={{
                  background: 'var(--el-surface)',
                  borderRadius: 16,
                  padding: 20,
                  maxWidth: 360,
                  width: '100%',
                  boxShadow: 'var(--el-shadow-lg)',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Đổi danh mục chi tiêu</div>
                <div style={{ fontSize: 12, color: 'var(--el-muted)', marginBottom: 14 }}>
                  Chọn danh mục mới cho giao dịch: <strong>{selectedTx.note || formatVnd(selectedTx.amount)}</strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 260, overflowY: 'auto', marginBottom: 16 }}>
                  {categories.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => handleRecategorize(selectedTx.id, c.code)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: `1.5px solid ${selectedTx.categoryCode === c.code ? 'var(--el-accent)' : 'var(--el-line)'}`,
                        background: selectedTx.categoryCode === c.code ? 'var(--el-accent-soft)' : 'var(--el-surface)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <Icon name={c.icon} size={16} style={{ color: c.color }} />
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</span>
                    </button>
                  ))}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <Button variant="ghost" onClick={() => setSelectedTx(null)}>
                    Đóng
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: NGÂN SÁCH THÁNG (BUDGETS) */}
      {tab === 'budgets' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--el-muted)', margin: '0 0 14px' }}>
            Đặt giới hạn chi tiêu theo tháng và nhận cảnh báo khi sắp chạm ngưỡng (80%) hoặc đã vượt giới hạn (100%).
          </p>

          {budgetSuccess && (
            <div style={{ padding: '8px 12px', background: '#e6f9ed', color: '#00875a', borderRadius: 8, fontSize: 12, marginBottom: 12 }}>
              {budgetSuccess}
            </div>
          )}

          {/* Form đặt ngân sách mới */}
          <Card>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 10 }}>Thiết lập ngân sách tháng này</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--el-muted)', display: 'block', marginBottom: 4 }}>Hạng mục</label>
                <select
                  value={budgetCategoryInput}
                  onChange={(e) => setBudgetCategoryInput(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--el-line)', fontSize: 13, background: 'var(--el-surface)', color: 'var(--el-ink)' }}
                >
                  <option value="ALL">Tổng chi tiêu toàn bộ tháng</option>
                  {categories.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              <TextField
                id="budgetLimit"
                label="Hạn mức ngân sách tối đa (VNĐ)"
                placeholder="VD: 5000000"
                value={budgetLimitInput}
                onChange={(e) => setBudgetLimitInput(e.target.value)}
              />

              <Button onClick={handleSaveBudget} disabled={budgetLoading || !budgetLimitInput.trim()}>
                {budgetLoading ? 'Đang lưu…' : 'Lưu ngân sách'}
              </Button>
            </div>
          </Card>

          {/* Danh sách các ngân sách đã đặt */}
          <h2 style={{ fontFamily: 'var(--el-font-display)', fontSize: 14.5, fontWeight: 700, margin: '20px 0 10px' }}>
            Tiến độ ngân sách ({budgets.length})
          </h2>

          {budgetLoading && budgets.length === 0 ? (
            <ProgressBar label="Đang tải ngân sách…" />
          ) : budgets.length === 0 ? (
            <Card>
              <EmptyState icon="account_balance_wallet" text="Bạn chưa đặt ngân sách nào cho tháng này. Hãy thiết lập một giới hạn bên trên để kiểm soát chi tiêu!" />
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {budgets.map((b) => {
                const isExceeded = b.status === 'EXCEEDED_100';
                const isWarning = b.status === 'WARNING_80';
                const barColor = isExceeded ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';

                return (
                  <div
                    key={b.id}
                    style={{
                      background: 'var(--el-surface)',
                      border: `1.5px solid ${isExceeded ? '#ef4444' : isWarning ? '#f59e0b' : 'var(--el-line)'}`,
                      borderRadius: 14,
                      padding: '14px 16px',
                      boxShadow: 'var(--el-shadow)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--el-ink)' }}>{b.categoryName}</div>
                      {isExceeded ? (
                        <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>
                          Đã vượt ngân sách!
                        </span>
                      ) : isWarning ? (
                        <span style={{ background: '#fef3c7', color: '#b45309', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>
                          Sắp chạm ngưỡng ({b.percentage}%)
                        </span>
                      ) : (
                        <span style={{ background: '#d1fae5', color: '#047857', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>
                          An toàn ({b.percentage}%)
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--el-muted)', marginBottom: 6 }}>
                      <span>Đã tiêu: <strong style={{ color: isExceeded ? '#ef4444' : 'var(--el-ink)' }}>{formatVnd(b.spentAmount)}</strong></span>
                      <span>Hạn mức: <strong>{formatVnd(b.budgetLimit)}</strong></span>
                    </div>

                    <div style={{ height: 8, borderRadius: 4, background: 'var(--el-line)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, b.percentage)}%`, background: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GHI CHI TIÊU TIỀN MẶT NGOÀI VÍ */}
      {tab === 'cash' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--el-muted)', margin: '0 0 14px' }}>
            Nhập nhanh các khoản chi bằng tiền mặt hoặc thẻ ngân hàng khác để sổ chi tiêu phản ánh đầy đủ 100% dòng tiền cá nhân.
          </p>

          {cashSuccess && (
            <div style={{ padding: '8px 12px', background: '#e6f9ed', color: '#00875a', borderRadius: 8, fontSize: 12, marginBottom: 12 }}>
              {cashSuccess}
            </div>
          )}

          <Card>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>+ Ghi chép chi tiêu tiền mặt</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <TextField
                id="cashAmount"
                label="Số tiền đã chi (VNĐ)"
                placeholder="VD: 35000"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
              />

              <div>
                <label style={{ fontSize: 12, color: 'var(--el-muted)', display: 'block', marginBottom: 4 }}>Danh mục chi tiêu</label>
                <select
                  value={cashCategory}
                  onChange={(e) => setCashCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--el-line)', fontSize: 13, background: 'var(--el-surface)', color: 'var(--el-ink)' }}
                >
                  {categories.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              <TextField
                id="cashNote"
                label="Ghi chú chi tiêu"
                placeholder="VD: Mua bánh mì ăn sáng"
                value={cashNote}
                onChange={(e) => setCashNote(e.target.value)}
              />

              <Button onClick={handleAddCashExpense} disabled={cashLoading || !cashAmount.trim()}>
                {cashLoading ? 'Đang lưu…' : 'Lưu khoản chi tiền mặt'}
              </Button>
            </div>
          </Card>

          <p style={{ fontSize: 11.5, color: 'var(--el-muted)', margin: '14px 2px', lineHeight: 1.4 }}>
            * Lưu ý: Ghi chép chi tiêu ngoài ví hoàn toàn không trừ tiền và không làm thay đổi số dư ví điện tử của bạn.
          </p>
        </div>
      )}
    </Screen>
  );
}
