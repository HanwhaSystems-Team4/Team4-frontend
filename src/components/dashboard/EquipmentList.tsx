import type { Equipment, EquipmentStatus } from '../../api/types'
import { EQUIPMENT_STATUS } from '../../constants/labels'
import { Badge } from '../Badge'
import { MachineIllustration } from '../icons'

const ORDER: Record<EquipmentStatus, number> = { critical: 0, warning: 1, normal: 2 }

export function EquipmentList({ equipment }: { equipment: Equipment[] }) {
  const sorted = [...equipment].sort((a, b) => ORDER[a.status] - ORDER[b.status])

  return (
    <section className="card" aria-labelledby="equip-title">
      <div className="card-head">
        <h2 id="equip-title">설비 상태</h2>
        <span className="muted">{equipment.length}대</span>
      </div>
      <ul className="equip-list">
        {sorted.map((e) => (
          <li className="equip" key={e.id}>
            <div className="equip-img">
              <MachineIllustration />
              <span className={`status-dot ${e.status}`} />
            </div>
            <div className="equip-body">
              <div className="equip-top">
                <div className="equip-name">
                  {e.name}
                  <span>
                    {e.id} · {e.line}
                  </span>
                </div>
                <Badge style={EQUIPMENT_STATUS[e.status]} />
              </div>
              <div className="equip-sensors num">
                <span>
                  공정온도 <b>{e.sensors.processTemp.toFixed(1)}K</b>
                </span>
                <span>
                  회전 <b>{e.sensors.rpm.toLocaleString()}rpm</b>
                </span>
                <span>
                  토크 <b>{e.sensors.torque}Nm</b>
                </span>
                <span>
                  공구 <b>{e.sensors.toolWear}분</b>
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
