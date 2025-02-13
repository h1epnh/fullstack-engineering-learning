#Example
from sqlalchemy import Column, Integer, String, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class ThongTinQuyHoach(Base):
    __tablename__ = "ttqh_chi_tiet"

    id = Column(Integer, primary_key=True)
    ThongTinChung = Column(JSON)
    LoGioi = Column(JSON)
    QHPK = Column(JSON)
    CTXD = Column(JSON)
    DCCB = Column(JSON)
    QHNganh = Column(JSON)
    QHChiTiet = Column(JSON)
    VatGoc = Column(JSON)
    blocked = Column(Integer, default=0)