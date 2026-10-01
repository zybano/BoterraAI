import { getDepartment, type Agent } from "@/lib/catalog/agents";
import { Icon } from "./icon";

const SIZES = {
  sm: "h-8 w-8 rounded-lg [&_svg]:h-4 [&_svg]:w-4",
  md: "h-11 w-11 rounded-xl [&_svg]:h-5 [&_svg]:w-5",
  lg: "h-14 w-14 rounded-2xl [&_svg]:h-7 [&_svg]:w-7",
};

export function AgentAvatar({ agent, size = "md" }: { agent: Agent; size?: keyof typeof SIZES }) {
  const department = getDepartment(agent.department);
  return (
    <span className={`inline-flex shrink-0 items-center justify-center ${SIZES[size]} ${department.accent}`}>
      <Icon name={agent.icon} />
    </span>
  );
}
