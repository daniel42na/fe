import { Chip, PopUpMenu, Stack, TextField } from "@zvoove/unity-ui";
import { useTranslation } from "react-i18next";

import type { EmployeeFilters } from "~/mocked/types/employee";
import {
  type EmployeeFilterKey,
  FILTER_KEYS,
  type SelectedFilters,
} from "../../hooks/useEmployeeFilters";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  selected: SelectedFilters;
  onToggleFilter: (key: EmployeeFilterKey, value: string) => void;
  filters: EmployeeFilters | null;
};

const FilterControls = ({
  search,
  onSearchChange,
  selected,
  onToggleFilter,
  filters,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Stack direction="row" gap="sm" align="center" wrap="wrap" width="100%">
      <div className="max-w-[300px] w-full">
        <TextField
          label={t("employees.search")}
          hideLabel
          name="employee-search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("employees.search")}
          icon="search"
          clearable
          density="-4"
        />
      </div>
      {FILTER_KEYS.map((key) => {
        const selectedValues = selected[key];
        const count = selectedValues.length;
        const label = t(`employees.filters.${key}`);

        return (
          <PopUpMenu
            key={key}
            selectable="multiple"
            selectedItem={selectedValues}
            onItemClick={(item) => onToggleFilter(key, item.id)}
            items={(filters?.[key] ?? []).map((option) => ({
              id: option.value,
              label: option.label,
              keepOpen: true,
            }))}
            density="-2"
          >
            <Chip
              type="filter"
              variant={count > 0 ? "secondary" : "primary"}
              label={count > 0 ? `${label} (${count})` : label}
              size="large"
              icon="filter"
            />
          </PopUpMenu>
        );
      })}
    </Stack>
  );
};

export default FilterControls;
